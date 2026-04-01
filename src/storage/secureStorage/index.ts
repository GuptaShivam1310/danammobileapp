import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'DanamMobileApp';

export async function setSecureToken(token: string) {
  await Keychain.setGenericPassword('auth', token, {
    service: SERVICE_NAME,
  });
}

export async function getSecureToken() {
  const credentials = await Keychain.getGenericPassword({
    service: SERVICE_NAME,
  });

  if (!credentials) {
    return null;
  }

  return credentials.password;
}

export async function removeSecureToken() {
  await Keychain.resetGenericPassword({
    service: SERVICE_NAME,
  });
}
