import { useCallback, useState } from 'react';
import { check, Permission, request, RESULTS } from 'react-native-permissions';

export function usePermissions(permission: Permission) {
  const [status, setStatus] = useState<string>('unavailable');

  const checkPermission = useCallback(async () => {
    const currentStatus = await check(permission);
    setStatus(currentStatus);
    return currentStatus;
  }, [permission]);

  const requestPermission = useCallback(async () => {
    const currentStatus = await request(permission);
    setStatus(currentStatus);
    return currentStatus === RESULTS.GRANTED;
  }, [permission]);

  return {
    status,
    checkPermission,
    requestPermission,
  };
}
