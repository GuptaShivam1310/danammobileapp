import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportUserModal } from '../../../src/components/common/ReportUserModal';
import { createStyles } from '../../../src/components/common/ReportUserModal/styles';
import { useTheme } from '../../../src/theme';

jest.mock('../../../src/theme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../../src/theme/scale', () => ({
  normalize: (v: number) => v,
  scale: (v: number) => v,
  verticalScale: (v: number) => v,
  moderateScale: (v: number) => v,
}));

jest.mock('../../../src/theme/fonts', () => ({
  fonts: { bold: 'Bold', regular: 'Regular', semiBold: 'SemiBold' },
}));

jest.mock('../../../src/theme/spacing', () => ({
  spacing: { md: 8, lg: 16, sm: 4, xl: 24 },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'reportUser.title') return `Report ${params?.name}`;
      if (key === 'reportUser.description') return 'Describe issue';
      if (key === 'reportUser.placeholder') return 'Enter reason';
      if (key === 'reportUser.cancel') return 'Cancel';
      if (key === 'reportUser.report') return 'Report';
      if (key === 'common.userFallback') return 'User';
      return key;
    },
  }),
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ReactLib.forwardRef(({ children, ...props }: any, ref: any) =>
      ReactLib.createElement(name, { ...props, ref }, children)
    );
  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TextInput: createPrimitive('TextInput'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
    Modal: createPrimitive('Modal'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    KeyboardAvoidingView: createPrimitive('KeyboardAvoidingView'),
    Keyboard: { dismiss: jest.fn() },
    Platform: { OS: 'ios' },
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  };
});

describe('ReportUserModal', () => {
  const mockOnReasonChange = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnReport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTheme as jest.Mock).mockReturnValue({
      theme: {
        colors: {
          surface: '#FFFFFF',
          text: '#111111',
          mutedText: '#777777',
          brandGreen: '#00AA66',
        },
      },
    });
  });

  it('renders with translated defaults when title/description are not provided', () => {
    const { getByTestId, getByText } = render(
      <ReportUserModal
        isVisible={true}
        reason=""
        userName="Alex"
        onReasonChange={mockOnReasonChange}
        onCancel={mockOnCancel}
        onReport={mockOnReport}
      />
    );

    expect(getByTestId('report-user-title').props.children).toBe('Report Alex');
    expect(getByTestId('report-user-description').props.children).toBe('Describe issue');
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Report')).toBeTruthy();
  });

  it('falls back to default user name when userName is missing', () => {
    const { getByTestId } = render(
      <ReportUserModal
        isVisible={true}
        reason=""
        onReasonChange={mockOnReasonChange}
        onCancel={mockOnCancel}
        onReport={mockOnReport}
      />
    );

    expect(getByTestId('report-user-title').props.children).toBe('Report User');
  });

  it('uses provided title/description and custom testID prefix', () => {
    const { getByTestId } = render(
      <ReportUserModal
        isVisible={true}
        title="Custom Title"
        description="Custom Desc"
        reason="test"
        onReasonChange={mockOnReasonChange}
        onCancel={mockOnCancel}
        onReport={mockOnReport}
        testIDPrefix="custom"
      />
    );

    expect(getByTestId('custom-title').props.children).toBe('Custom Title');
    expect(getByTestId('custom-description').props.children).toBe('Custom Desc');
    expect(getByTestId('custom-input')).toBeTruthy();
    expect(getByTestId('custom-cancel-button')).toBeTruthy();
    expect(getByTestId('custom-submit-button')).toBeTruthy();
  });

  it('handles input change and button presses', () => {
    const { getByTestId } = render(
      <ReportUserModal
        isVisible={true}
        reason="Reason"
        onReasonChange={mockOnReasonChange}
        onCancel={mockOnCancel}
        onReport={mockOnReport}
      />
    );

    fireEvent.changeText(getByTestId('report-user-input'), 'New reason');
    expect(mockOnReasonChange).toHaveBeenCalledWith('New reason');

    fireEvent.press(getByTestId('report-user-cancel-button'));
    expect(mockOnCancel).toHaveBeenCalled();

    fireEvent.press(getByTestId('report-user-submit-button'));
    expect(mockOnReport).toHaveBeenCalled();
  });

  it('disables submit when reason is empty or loading, shows loader when loading', () => {
    const { getByTestId, rerender, queryByTestId } = render(
      <ReportUserModal
        isVisible={true}
        reason=""
        onReasonChange={mockOnReasonChange}
        onCancel={mockOnCancel}
        onReport={mockOnReport}
        isLoading={false}
      />
    );

    expect(getByTestId('report-user-submit-button').props.disabled).toBe(true);
    expect(queryByTestId('report-user-loading-indicator')).toBeNull();

    rerender(
      <ReportUserModal
        isVisible={true}
        reason="Valid"
        onReasonChange={mockOnReasonChange}
        onCancel={mockOnCancel}
        onReport={mockOnReport}
        isLoading={true}
      />
    );

    expect(getByTestId('report-user-submit-button').props.disabled).toBe(true);
    expect(getByTestId('report-user-cancel-button').props.disabled).toBe(true);
    expect(getByTestId('report-user-loading-indicator')).toBeTruthy();
  });

  it('creates styles from theme', () => {
    const styles = createStyles({
      colors: { surface: '#ABC', text: '#111', mutedText: '#999', brandGreen: '#0A0' },
    });

    expect(styles.container.backgroundColor).toBe('#ABC');
    expect(styles.title.color).toBe('#111');
    expect(styles.description.color).toBe('#999');
    expect(styles.reportButton.backgroundColor).toBe('#0A0');
  });
});
