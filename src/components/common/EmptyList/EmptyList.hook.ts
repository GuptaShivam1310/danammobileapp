import { useCallback } from 'react';

interface UseEmptyListParams {
  btnCallBack: () => void;
}

export function useEmptyList({ btnCallBack }: UseEmptyListParams) {
  const onPressButton = useCallback(() => {
    btnCallBack();
  }, [btnCallBack]);

  return {
    onPressButton,
  };
}
