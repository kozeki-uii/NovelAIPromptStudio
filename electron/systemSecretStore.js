// Chromium's basic_text backend uses a password known to every installation.
// Linux must have a real desktop secret store for persistent credentials.
export function systemSecretStore(safeStorage, platform = process.platform) {
  if (platform !== 'linux') return safeStorage;

  const isEncryptionAvailable = () => {
    if (!safeStorage.isEncryptionAvailable()) return false;
    const backend = safeStorage.getSelectedStorageBackend();
    return backend !== 'basic_text' && backend !== 'unknown';
  };
  const requireSecretStore = () => {
    if (!isEncryptionAvailable()) throw new Error('请解锁 KWallet 或启用系统密钥库后重试');
  };
  return {
    isEncryptionAvailable,
    encryptString(value) {
      requireSecretStore();
      return safeStorage.encryptString(value);
    },
    decryptString(value) {
      requireSecretStore();
      return safeStorage.decryptString(value);
    },
  };
}
