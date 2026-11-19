import { describe, expect, it, vi } from 'vitest';
import { systemSecretStore } from './systemSecretStore.js';

describe('Linux system secret store', () => {
  const storage = (backend) => ({
    getSelectedStorageBackend: () => backend,
    isEncryptionAvailable: () => true,
    encryptString: vi.fn(() => Buffer.from('ciphertext')),
    decryptString: vi.fn(() => 'test data'),
  });
  it.each(['basic_text', 'unknown'])('rejects Linux fallback: %s', (backend) => {
    const native = storage(backend);
    const store = systemSecretStore(native, 'linux');
    expect(store.isEncryptionAvailable()).toBe(false);
    expect(() => store.encryptString('test data')).toThrow(/KWallet/);
    expect(() => store.decryptString(Buffer.alloc(0))).toThrow(/KWallet/);
    expect(native.encryptString).not.toHaveBeenCalled();
    expect(native.decryptString).not.toHaveBeenCalled();
  });
  it.each(['kwallet6', 'gnome_libsecret'])('uses the native %s backend', (backend) => {
    const native = storage(backend);
    const store = systemSecretStore(native, 'linux');
    expect(store.isEncryptionAvailable()).toBe(true);
    expect(store.decryptString(store.encryptString('test data'))).toBe('test data');
  });
});
