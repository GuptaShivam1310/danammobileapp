import React from 'react';
import { render } from '@testing-library/react-native';
import { AppBottomSheet } from '../../../src/components/common/AppBottomSheet';
import { useTheme } from '../../../src/theme';
import { palette } from '../../../src/constants/colors';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: any) =>
      ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

const mockPresent = jest.fn();
const mockDismiss = jest.fn();
let mockBottomSheetModalProps: any = null;

jest.mock('@gorhom/bottom-sheet', () => {
  const ReactLib = require('react');
  return {
    BottomSheetModal: ReactLib.forwardRef((props: any, ref: any) => {
      mockBottomSheetModalProps = props;
      ReactLib.useImperativeHandle(ref, () => ({
        present: mockPresent,
        dismiss: mockDismiss,
      }));
      return ReactLib.createElement('BottomSheetModal', props, props.children);
    }),
    BottomSheetBackdrop: (props: any) =>
      ReactLib.createElement('BottomSheetBackdrop', props, props.children),
    BottomSheetView: (props: any) =>
      ReactLib.createElement('BottomSheetView', props, props.children),
  };
});

const mockedUseTheme = useTheme as jest.Mock;

describe('AppBottomSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      theme: {
        colors: {
          surface: '#ffffff',
        },
      },
    });
  });

  it('presents and dismisses when visibility changes', () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <AppBottomSheet isVisible onClose={onClose}>
        <></>
      </AppBottomSheet>,
    );

    expect(mockPresent).toHaveBeenCalledTimes(1);

    rerender(
      <AppBottomSheet isVisible={false} onClose={onClose}>
        <></>
      </AppBottomSheet>,
    );

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when sheet is dismissed', () => {
    const onClose = jest.fn();

    render(
      <AppBottomSheet isVisible onClose={onClose}>
        <></>
      </AppBottomSheet>,
    );

    mockBottomSheetModalProps.onChange(-1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('passes overlay style to backdrop and theme surface to background', () => {
    render(
      <AppBottomSheet
        isVisible
        onClose={jest.fn()}
        overlayStyle={{ backgroundColor: palette.homeFilterOverlay }}
      >
        <></>
      </AppBottomSheet>,
    );

    const backdrop = mockBottomSheetModalProps.backdropComponent({ style: {} });
    expect(backdrop.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: palette.homeFilterOverlay }),
      ]),
    );

    expect(mockBottomSheetModalProps.backgroundStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#ffffff' }),
      ]),
    );
  });
});
