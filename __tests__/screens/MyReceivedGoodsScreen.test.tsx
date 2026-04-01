import { renderHook, act, render, waitFor } from '@testing-library/react-native';
import React from 'react';

// ─── Stable Mocks ─────────────────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNav = { goBack: mockGoBack, getParent: () => ({ getParent: () => ({ navigate: mockNavigate }) }) };
const mockT = (k: string) => k;

jest.mock('react-native', () => {
  const ReactLib = require('react');
  return {
    View: ({ children, ...props }: any) => ReactLib.createElement('View', props, children),
    Text: ({ children, ...props }: any) => ReactLib.createElement('Text', props, children),
    TouchableOpacity: ({ children, ...props }: any) => ReactLib.createElement('TouchableOpacity', props, children),
    FlatList: (p: any) => {
      const items = p.data.map((item: any, index: number) =>
        ReactLib.createElement(
          ReactLib.Fragment,
          { key: item?.id ?? item?.key ?? index },
          p.renderItem({ item, index }),
        ),
      );
      const empty = p.data.length === 0
        ? (typeof p.ListEmptyComponent === 'function' ? ReactLib.createElement(p.ListEmptyComponent) : p.ListEmptyComponent)
        : null;
      return ReactLib.createElement('View', { testID: p.testID }, [
        empty && ReactLib.createElement(ReactLib.Fragment, { key: 'empty' }, empty),
        ...items,
      ].filter(Boolean));
    },
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  };
});

jest.mock('@react-navigation/native', () => ({ useNavigation: () => mockNav }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: mockT }) }));
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));
jest.mock('../../src/services/api/postApi', () => ({ postApi: { getAssignedContributions: jest.fn() } }));
jest.mock('../../src/theme', () => ({ useTheme: () => ({ theme: { colors: {} } }) }));

jest.mock('../../src/components/common/ScreenWrapper', () => ({ ScreenWrapper: ({ children }: any) => children }));
jest.mock('../../src/components/common/Header', () => ({
  Header: (p: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('View', { onTouchEnd: p.onBackPress });
  }
}));
jest.mock('../../src/components/common/AppLoader', () => ({ AppLoader: () => null }));
jest.mock('../../src/components/specified/home/ProductCard', () => ({
  ProductCard: (p: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('View', { onTouchEnd: p.onPress, testID: p.testID }, ReactLib.createElement('Text', {}, p.item.title));
  }
}));

// ─── Imports ────────────────────────────────────────────────────────────────
import { useMyReceivedGoodsScreen } from '../../src/screens/MyReceivedGoods/MyReceivedGoodsScreen.hook';
import { MyReceivedGoodsScreen } from '../../src/screens/MyReceivedGoods/MyReceivedGoodsScreen';
import { postApi } from '../../src/services/api/postApi';

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('MyReceivedGoods', () => {
  const mockData = { data: { items: [{ id: '1', title: 'P1' }], total: 20 } };

  beforeEach(() => {
    jest.clearAllMocks();
    (postApi.getAssignedContributions as jest.Mock).mockResolvedValue(mockData);
  });

  it('manages data lifecycle', async () => {
    const { result } = renderHook(() => useMyReceivedGoodsScreen());
    await waitFor(() => expect(result.current.receivedProducts.length).toBe(1));

    await act(async () => {
      await result.current.onRefresh();
      await result.current.onEndReached();
      result.current.onPressProduct(result.current.receivedProducts[0]);
      result.current.onGoBack();
    });

    expect(mockNavigate).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('handles errors', async () => {
    (postApi.getAssignedContributions as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useMyReceivedGoodsScreen());
    await waitFor(() => expect(result.current.error).toBe('fail'));
  });

  it('renders UI', async () => {
    const { getByText } = render(<MyReceivedGoodsScreen />);
    await waitFor(() => expect(getByText('P1')).toBeTruthy());

    (postApi.getAssignedContributions as jest.Mock).mockResolvedValue({ data: { items: [], total: 0 } });
    const { getByText: getByTextEmpty } = render(<MyReceivedGoodsScreen />);
    await waitFor(() => expect(getByTextEmpty('myReceivedGoods.empty')).toBeTruthy());
  });
});
