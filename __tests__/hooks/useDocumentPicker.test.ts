import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useDocumentPicker } from '../../src/hooks/useDocumentPicker';

const mockPick = jest.fn();
const mockIsErrorWithCode = jest.fn();

jest.mock('@react-native-documents/picker', () => ({
  pick: (...args: any[]) => mockPick(...args),
  types: { allFiles: 'allFiles' },
  isErrorWithCode: (...args: any[]) => mockIsErrorWithCode(...args),
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
}));

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useDocumentPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('picks a document and maps result', async () => {
    mockPick.mockResolvedValueOnce([
      { uri: 'file://doc.pdf', name: 'doc.pdf', type: 'application/pdf', size: 1024 },
    ]);

    const { result } = renderHook(() => useDocumentPicker());
    const callback = jest.fn();

    await act(async () => {
      await result.current.pickDocument(callback);
    });

    expect(callback).toHaveBeenCalledWith({
      uri: 'file://doc.pdf',
      name: 'doc.pdf',
      type: 'application/pdf',
      size: 1024,
    });
  });

  it('prevents concurrent picking', async () => {
    let resolvePick: any;
    mockPick.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePick = resolve;
        })
    );

    const { result } = renderHook(() => useDocumentPicker());
    const callback = jest.fn();

    let firstPromise: Promise<void>;
    await act(async () => {
      firstPromise = result.current.pickDocument(callback);
    });

    await act(async () => {
      await result.current.pickDocument(callback);
    });

    resolvePick([]);
    await act(async () => {
      await firstPromise;
    });

    expect(mockPick).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });

  it('handles picker cancel without alert', async () => {
    mockPick.mockRejectedValueOnce({ code: 'OPERATION_CANCELED' });
    mockIsErrorWithCode.mockReturnValueOnce(true);

    const { result } = renderHook(() => useDocumentPicker());

    await act(async () => {
      await result.current.pickDocument(jest.fn());
    });

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('alerts on picker error', async () => {
    mockPick.mockRejectedValueOnce(new Error('fail'));
    mockIsErrorWithCode.mockReturnValueOnce(false);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useDocumentPicker());

    await act(async () => {
      await result.current.pickDocument(jest.fn());
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'alerts.error',
      'alerts.failedToOpenDocumentPicker'
    );
    errorSpy.mockRestore();
  });

  it('formats file size', () => {
    const { result } = renderHook(() => useDocumentPicker());

    expect(result.current.formatFileSize()).toBe('0 B');
    expect(result.current.formatFileSize(0)).toBe('0 B');
    expect(result.current.formatFileSize(1024)).toBe('1 KB');
    expect(result.current.formatFileSize(1048576)).toBe('1 MB');
  });
});
