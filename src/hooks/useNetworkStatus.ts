import { useMemo } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const netInfo = useNetInfo();

  return useMemo(
    () => ({
      isConnected: Boolean(netInfo.isConnected && netInfo.isInternetReachable !== false),
      type: netInfo.type,
      details: netInfo.details,
    }),
    [netInfo.details, netInfo.isConnected, netInfo.isInternetReachable, netInfo.type],
  );
}
