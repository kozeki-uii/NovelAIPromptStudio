import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Menu, Tray } from 'electron';

const execute = promisify(execFile);
const appName = 'NovelAI Prompt Studio';

export async function hasLinuxTrayHost() {
  try {
    const { stdout } = await execute(
      'gdbus',
      [
        'call',
        '--session',
        '--timeout',
        '2',
        '--dest',
        'org.kde.StatusNotifierWatcher',
        '--object-path',
        '/StatusNotifierWatcher',
        '--method',
        'org.freedesktop.DBus.Properties.Get',
        'org.kde.StatusNotifierWatcher',
        'IsStatusNotifierHostRegistered',
      ],
      { timeout: 2500 },
    );
    return stdout.trim() === '(<true>,)';
  } catch {
    // Without a status notifier host, closing the window must still quit.
    return false;
  }
}

export function createLinuxTray({ icon, showMain, quit }) {
  const tray = new Tray(icon);
  const show = { id: 'show', label: '打开主窗口', click: showMain };
  const exit = { id: 'quit', label: '退出', click: quit };
  let menu;
  let progress = '';
  const update = (nextProgress) => {
    progress = nextProgress;
    tray.setToolTip(progress ? `${appName} · ${progress}` : appName);
    menu = Menu.buildFromTemplate([
      show,
      ...(progress ? [{ label: progress, enabled: false }, { type: 'separator' }] : []),
      exit,
    ]);
    tray.setContextMenu(menu);
  };
  tray.on('click', showMain);
  update('');
  return {
    tray,
    get nativeMenu() {
      return menu;
    },
    generation({ jobs }) {
      const job = jobs.find(({ state }) => state === 'generating');
      const nextProgress = job ? `正在生成 ${job.index}/${job.count}` : '';
      if (nextProgress !== progress) update(nextProgress);
    },
    destroy: () => tray.destroy(),
  };
}
