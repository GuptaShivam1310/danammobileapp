import { renderHook, act } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import { useImagePicker } from '../../src/hooks/useImagePicker';

const mockLaunchCamera = jest.fn();
const mockLaunchImageLibrary = jest.fn();
const mockCheck = jest.fn();
const mockRequest = jest.fn();

jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: 'ios' },
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: (...args: any[]) => mockLaunchCamera(...args),
  launchImageLibrary: (...args: any[]) => mockLaunchImageLibrary(...args),
}));

jest.mock('react-native-permissions', () => ({
  check: (...args: any[]) => mockCheck(...args),
  request: (...args: any[]) => mockRequest(...args),
  PERMISSIONS: { IOS: { CAMERA: 'ios.camera' }, ANDROID: { CAMERA: 'android.camera' } },
  RESULTS: { GRANTED: 'granted' },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('lodash', () => ({
  get: (obj: any, path: string) => obj?.[path],
  isEmpty: (arr: any) => !arr || arr.length === 0,
}));

describe('useImagePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('denies camera when permission is not granted', async () => {
    mockCheck.mockResolvedValueOnce('denied');
    mockRequest.mockResolvedValueOnce('denied');

    const { result } = renderHook(() => useImagePicker());

    await act(async () => {
      await result.current.takePhoto(jest.fn());
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'alerts.permissionDenied',
      'alerts.cameraPermissionRequired'
    );
  });

  it('takes photo and returns asset', async () => {
    mockCheck.mockResolvedValueOnce('granted');
    mockLaunchCamera.mockResolvedValueOnce({ assets: [{ uri: 'file://photo.jpg' }] });

    const { result } = renderHook(() => useImagePicker());
    const callback = jest.fn();

    await act(async () => {
      await result.current.takePhoto(callback);
    });

    expect(callback).toHaveBeenCalledWith({ uri: 'file://photo.jpg' });
  });

  it('handles camera errorCode', async () => {
    mockCheck.mockResolvedValueOnce('granted');
    mockLaunchCamera.mockResolvedValueOnce({ errorCode: 'camera_unavailable', errorMessage: 'No camera' });

    const { result } = renderHook(() => useImagePicker());
    await act(async () => {
      await result.current.takePhoto(jest.fn());
    });

    expect(Alert.alert).toHaveBeenCalledWith('alerts.error', 'No camera');
  });

  it('selects from gallery and returns asset', async () => {
    mockLaunchImageLibrary.mockResolvedValueOnce({ assets: [{ uri: 'file://gallery.jpg' }] });

    const { result } = renderHook(() => useImagePicker());
    const callback = jest.fn();

    await act(async () => {
      await result.current.selectFromGallery(callback);
    });

    expect(callback).toHaveBeenCalledWith({ uri: 'file://gallery.jpg' });
  });

  it('handles gallery errorCode', async () => {
    mockLaunchImageLibrary.mockResolvedValueOnce({ errorCode: 'failed', errorMessage: '' });

    const { result } = renderHook(() => useImagePicker());
    await act(async () => {
      await result.current.selectFromGallery(jest.fn());
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'alerts.error',
      'alerts.failedToOpenGallery'
    );
  });

  it('handles gallery unexpected error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLaunchImageLibrary.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useImagePicker());
    await act(async () => {
      await result.current.selectFromGallery(jest.fn());
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'alerts.error',
      'alerts.unexpectedGalleryError'
    );
    errorSpy.mockRestore();
  });

  it('handles camera unexpected error', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCheck.mockResolvedValueOnce('granted');
    mockLaunchCamera.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useImagePicker());
    await act(async () => {
      await result.current.takePhoto(jest.fn());
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'alerts.error',
      'alerts.unexpectedCameraError'
    );
    errorSpy.mockRestore();
  });

  it('skips callbacks when user cancels', async () => {
    mockCheck.mockResolvedValueOnce('granted');
    mockLaunchCamera.mockResolvedValueOnce({ didCancel: true });
    mockLaunchImageLibrary.mockResolvedValueOnce({ didCancel: true });

    const { result } = renderHook(() => useImagePicker());
    const callback = jest.fn();

    await act(async () => {
      await result.current.takePhoto(callback);
    });
    await act(async () => {
      await result.current.selectFromGallery(callback);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('requests android permission', async () => {
    (Platform as any).OS = 'android';
    mockCheck.mockResolvedValueOnce('denied');
    mockRequest.mockResolvedValueOnce('granted');
    mockLaunchCamera.mockResolvedValueOnce({ assets: [{ uri: 'file://photo.jpg' }] });

    const { result } = renderHook(() => useImagePicker());
    await act(async () => {
      await result.current.takePhoto(jest.fn());
    });

    expect(mockCheck).toHaveBeenCalledWith('android.camera');
  });
});
