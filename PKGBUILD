pkgname=novelai-prompt-studio
pkgver=2.0.8
pkgrel=1
pkgdesc='Desktop workspace for NovelAI images and prompts'
arch=('x86_64')
url='https://github.com/kozeki-uii/NovelAIPromptStudio'
license=('GPL-3.0-only')
depends=(
  'alsa-lib' 'at-spi2-core' 'cairo' 'dbus' 'expat' 'fontconfig' 'glib2' 'glibc'
  'gtk3' 'hicolor-icon-theme' 'libcups' 'libdrm' 'libgcc' 'libstdc++' 'libx11'
  'libxcb' 'libxcomposite' 'libxdamage' 'libxext' 'libxfixes' 'libxkbcommon'
  'libxrandr' 'mesa' 'nspr' 'nss' 'pango' 'systemd-libs' 'xdg-utils'
)
makedepends=('nodejs>=22.12.0' 'npm')
optdepends=(
  'kwallet: encrypted credential storage on KDE Plasma'
  'libsecret: integration with a Secret Service provider on other desktops'
)
# Electron and its bundled native modules are already built.
options=('!strip' '!debug')

build() {
  cd "$startdir"
  local app_version
  app_version="$(node -p 'require("./package.json").version')"
  if [[ "$app_version" != "$pkgver" ]]; then
    printf 'PKGBUILD pkgver (%s) must match package.json (%s).\n' "$pkgver" "$app_version" >&2
    return 1
  fi

  npm ci --no-audit --no-fund
  npm run fonts
  npm run package -- --linux dir --x64 "-c.directories.output=$srcdir/arch-build"
}

package() {
  local app_dir="$pkgdir/usr/lib/$pkgname"
  local desktop_id='studio.novelai.prompt'
  local size

  install -d "$app_dir" "$pkgdir/usr/bin"
  cp -a "$srcdir/arch-build/linux-unpacked/." "$app_dir/"
  ln -s "../lib/$pkgname/$pkgname" "$pkgdir/usr/bin/$pkgname"

  install -Dm644 "$startdir/packaging/arch/$desktop_id.desktop" \
    "$pkgdir/usr/share/applications/$desktop_id.desktop"
  for size in 16 32 48 64 128 256 512; do
    install -Dm644 "$startdir/build/icons/icon-$size.png" \
      "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/$desktop_id.png"
  done
}
