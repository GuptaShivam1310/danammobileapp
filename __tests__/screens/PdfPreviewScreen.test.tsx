import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PdfPreviewScreen } from '../../src/screens/Chat/PdfPreviewScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';

jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('react-native-pdf', () => {
  const ReactLib = require('react');
  return (props: any) => ReactLib.createElement('Pdf', { ...props, testID: 'pdf-viewer' });
});

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    StatusBar: createPrimitive('StatusBar'),
    SafeAreaView: createPrimitive('SafeAreaView'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

jest.mock('../../src/constants/colors', () => ({
  palette: {
    blackPure: '#000',
    white: '#fff',
    modalOverlay: '#111',
    modalOverlayDark: '#222',
  },
}));

jest.mock('../../src/theme/scale', () => ({
  scale: (val: number) => val,
  verticalScale: (val: number) => val,
  normalize: (val: number) => val,
}));

jest.mock('../../src/theme/fonts', () => ({
  fonts: {
    semiBold: 'SemiBold',
    medium: 'Medium',
  },
}));

const mockUseNavigation = useNavigation as jest.Mock;
const mockUseRoute = useRoute as jest.Mock;

describe('PdfPreviewScreen', () => {
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue({ goBack: mockGoBack });
  });

  it('renders pdf and decodes uri', () => {
    mockUseRoute.mockReturnValue({
      name: ROUTES.CHAT_PDF_VIEW,
      params: {
        pdfUri: 'https%3A%2F%2Fexample.com%2Ffile.pdf',
        fileName: 'File.pdf',
      },
    });

    const { getByTestId, getByText } = render(<PdfPreviewScreen />);

    expect(getByText('File.pdf')).toBeTruthy();

    const pdf = getByTestId('pdf-viewer');
    expect(pdf.props.source.uri).toBe('https://example.com/file.pdf');
    expect(pdf.props.enablePaging).toBe(true);
    expect(pdf.props.trustAllCerts).toBe(false);
  });

  it('uses fallback title and handles back press', () => {
    mockUseRoute.mockReturnValue({
      name: ROUTES.CHAT_PDF_VIEW,
      params: { pdfUri: 'file.pdf', fileName: undefined },
    });

    const { getByText, getByTestId } = render(<PdfPreviewScreen />);

    expect(getByText('PDF Preview')).toBeTruthy();

    fireEvent.press(getByTestId('pdf-preview-back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('handles missing pdf uri', () => {
    mockUseRoute.mockReturnValue({
      name: ROUTES.CHAT_PDF_VIEW,
      params: { pdfUri: undefined, fileName: 'Doc' },
    });

    const { getByTestId } = render(<PdfPreviewScreen />);

    const pdf = getByTestId('pdf-viewer');
    expect(pdf.props.source.uri).toBe('');
  });

  it('renders loading indicator and logs errors', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockUseRoute.mockReturnValue({
      name: ROUTES.CHAT_PDF_VIEW,
      params: { pdfUri: 'file.pdf', fileName: 'Doc' },
    });

    const { getByTestId, getByText, queryByTestId } = render(<PdfPreviewScreen />);

    const pdf = getByTestId('pdf-viewer');
    const loadingElement = pdf.props.renderActivityIndicator();

    const { getByText: getByTextFromLoading } = render(loadingElement);
    expect(getByTextFromLoading('Loading PDF...')).toBeTruthy();

    expect(queryByTestId('pdf-preview-back-button')).toBeTruthy();

    pdf.props.onError('boom');
    expect(logSpy).toHaveBeenCalledWith('Pdf Viewer Error:', 'boom');

    logSpy.mockRestore();
  });
});
