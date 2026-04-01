import { renderHook, act } from '@testing-library/react-native';
import { useGoBack } from '../../src/hooks/useGoBack';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe('useGoBack', () => {
  it('calls navigation.goBack', () => {
    const { result } = renderHook(() => useGoBack());
    act(() => {
      result.current();
    });
    expect(mockGoBack).toHaveBeenCalled();
  });
});
