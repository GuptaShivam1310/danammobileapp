import {
  check,
  openSettings,
  Permission,
  request,
  RESULTS,
} from 'react-native-permissions';

export async function ensurePermission(permission: Permission) {
  const status = await check(permission);

  if (status === RESULTS.GRANTED) {
    return true;
  }

  const requested = await request(permission);
  return requested === RESULTS.GRANTED;
}

export async function goToAppSettings() {
  await openSettings();
}
