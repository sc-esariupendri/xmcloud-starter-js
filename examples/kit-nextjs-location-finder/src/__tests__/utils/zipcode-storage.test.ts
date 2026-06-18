import {
  clearZipcodeFromSession,
  decryptZipcodeFromStorage,
  encryptZipcodeForStorage,
  readZipcodeFromSession,
  storeZipcodeInSession,
} from '@/utils/zipcode-storage';
import { USER_ZIPCODE } from '@/lib/constants';

describe('zipcode-storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips zipcodes through encrypted session storage', () => {
    storeZipcodeInSession('90210');

    expect(sessionStorage.getItem(USER_ZIPCODE)).not.toBe('90210');
    expect(readZipcodeFromSession()).toBe('90210');
  });

  it('encrypts and decrypts zipcodes', () => {
    const encoded = encryptZipcodeForStorage('M5V 2T6');

    expect(encoded).not.toBe('M5V 2T6');
    expect(decryptZipcodeFromStorage(encoded)).toBe('M5V 2T6');
  });

  it('reads legacy cleartext values for backward compatibility', () => {
    sessionStorage.setItem(USER_ZIPCODE, '10001');

    expect(readZipcodeFromSession()).toBe('10001');
  });

  it('clears stored zipcodes', () => {
    storeZipcodeInSession('30301');
    clearZipcodeFromSession();

    expect(readZipcodeFromSession()).toBeNull();
  });
});
