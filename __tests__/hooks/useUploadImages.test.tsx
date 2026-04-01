import { act, renderHook } from '@testing-library/react-native';
import { useUploadImages } from '../../src/screens/UploadImages/useUploadImages';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addImage, removeImage, setImages } from '../../src/store/slices/postSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { postApi } from '../../src/services/api/postApi';
import { ROUTES } from '../../src/constants/routes';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../src/store/slices/postSlice', () => ({
  addImage: jest.fn((uri: string) => ({ type: 'addImage', payload: uri })),
  removeImage: jest.fn((index: number) => ({ type: 'removeImage', payload: index })),
  setImages: jest.fn((images: string[]) => ({ type: 'setImages', payload: images })),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

jest.mock('../../src/services/api/postApi', () => ({
  postApi: {
    uploadImage: jest.fn(),
  },
}));

jest.mock('react-native', () => {
  const React = require('react');
  const createPrimitive =
    (name: string) =>
    ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    Pressable: createPrimitive('Pressable'),
    TextInput: createPrimitive('TextInput'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Alert: {
      alert: jest.fn(),
    },
    PermissionsAndroid: {
      request: jest.fn(),
      PERMISSIONS: { CAMERA: 'CAMERA' },
      RESULTS: { GRANTED: 'granted', DENIED: 'denied' },
    },
    Platform: { OS: 'android' },
  };
});

const mockedUseNavigation = useNavigation as jest.Mock;
const mockedUseDispatch = useDispatch as jest.Mock;
const mockedUseSelector = useSelector as jest.Mock;

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockImages: string[] = [];

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const setImagesForTest = (images: string[]) => {
  mockImages = images;
  mockedUseSelector.mockImplementation((selector: any) =>
    selector({ post: { newPostData: { images: mockImages } } }),
  );
};

const permissionsRequest = PermissionsAndroid.request as jest.Mock;
const alertSpy = Alert.alert as jest.Mock;
const uploadImageMock = postApi.uploadImage as jest.Mock;
const launchCameraMock = launchCamera as jest.Mock;
const launchImageLibraryMock = launchImageLibrary as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseNavigation.mockReturnValue({ navigate: mockNavigate, goBack: mockGoBack });
  mockedUseDispatch.mockReturnValue(mockDispatch);
  setImagesForTest([]);
  permissionsRequest.mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
  (Platform as any).OS = 'android';
});

describe('useUploadImages', () => {
  it('handles camera permission denied', async () => {
    permissionsRequest.mockResolvedValueOnce(PermissionsAndroid.RESULTS.DENIED);

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleCapture();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Permission Denied',
      'Camera permission is required to capture photos.',
    );
    expect(launchCameraMock).not.toHaveBeenCalled();
  });

  it('handles camera permission error and shows alert', async () => {
    permissionsRequest.mockRejectedValueOnce(new Error('perm error'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleCapture();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Permission Denied',
      'Camera permission is required to capture photos.',
    );

    warnSpy.mockRestore();
  });

  it('handles capture on non-android', async () => {
    (Platform as any).OS = 'ios';
    launchCameraMock.mockImplementation((_options: any, cb: any) =>
      cb({ didCancel: true }),
    );

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleCapture();
    });

    expect(permissionsRequest).not.toHaveBeenCalled();
    expect(launchCameraMock).toHaveBeenCalled();
  });

  it('handles image picker error response', async () => {
    launchCameraMock.mockImplementation((_options: any, cb: any) =>
      cb({ errorCode: 'camera_unavailable', errorMessage: 'no camera' }),
    );

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleCapture();
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'no camera');
  });

  it('uses fallback error message when image picker has no message', () => {
    launchImageLibraryMock.mockImplementation((_options: any, cb: any) =>
      cb({ errorCode: 'error' }),
    );

    const { result } = renderHook(() => useUploadImages());

    act(() => {
      result.current.handleChooseGallery();
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Something went wrong');
  });

  it('ignores gallery cancel and adds new images only', async () => {
    setImagesForTest(['existing']);
    launchImageLibraryMock.mockImplementation((_options: any, cb: any) =>
      cb({
        didCancel: false,
        assets: [{ uri: 'new-uri' }, { uri: 'existing' }, { uri: undefined }],
      }),
    );

    const { result } = renderHook(() => useUploadImages());

    act(() => {
      result.current.handleChooseGallery();
    });

    expect(addImage).toHaveBeenCalledWith('new-uri');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'addImage',
      payload: 'new-uri',
    });
  });

  it('does nothing on gallery cancel', () => {
    launchImageLibraryMock.mockImplementation((_options: any, cb: any) =>
      cb({ didCancel: true }),
    );

    const { result } = renderHook(() => useUploadImages());

    act(() => {
      result.current.handleChooseGallery();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('deletes image by index', () => {
    const { result } = renderHook(() => useUploadImages());

    act(() => {
      result.current.handleDeleteImage(2);
    });

    expect(removeImage).toHaveBeenCalledWith(2);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'removeImage',
      payload: 2,
    });
  });

  it('navigates back', () => {
    const { result } = renderHook(() => useUploadImages());

    act(() => {
      result.current.handleBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('alerts when no images are selected', async () => {
    setImagesForTest([]);
    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleNext();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'No Images',
      'Please upload at least one image.',
    );
    expect(uploadImageMock).not.toHaveBeenCalled();
  });

  it('uploads images and navigates on success', async () => {
    setImagesForTest(['uri-1', 'uri-1', 'uri-2']);
    uploadImageMock.mockImplementation(async (uri: string) => {
      if (uri === 'uri-1') {
        return { data: { file_url: 'url-1' } };
      }
      return { file_url: 'url-2' };
    });

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleNext();
      await flushPromises();
    });

    expect(setImages).toHaveBeenCalledWith(['url-1', 'url-2']);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'setImages',
      payload: ['url-1', 'url-2'],
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SELECT_LOCATION);
  });

  it('falls back to original uri when upload response has no url', async () => {
    setImagesForTest(['uri-raw']);
    uploadImageMock.mockResolvedValueOnce({});

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleNext();
      await flushPromises();
    });

    expect(setImages).toHaveBeenCalledWith(['uri-raw']);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SELECT_LOCATION);
  });

  it('shows partial success alert and proceeds on confirm', async () => {
    setImagesForTest(['uri-1', 'uri-2']);
    uploadImageMock
      .mockResolvedValueOnce({ data: { file_url: 'url-1' } })
      .mockRejectedValueOnce(new Error('upload failed'));

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleNext();
      await flushPromises();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Partial Success',
      expect.stringContaining('1 images failed to upload'),
      expect.any(Array),
    );

    const buttons = alertSpy.mock.calls[0][2];
    await act(async () => {
      buttons[1].onPress();
    });

    expect(setImages).toHaveBeenCalledWith(['url-1']);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SELECT_LOCATION);
  });

  it('counts failed uploads when result is empty', async () => {
    setImagesForTest(['good-uri', '']);
    uploadImageMock.mockResolvedValueOnce({ data: { file_url: 'good-url' } });

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleNext();
      await flushPromises();
    });

    const buttons = alertSpy.mock.calls[0][2];
    await act(async () => {
      buttons[1].onPress();
    });

    expect(setImages).toHaveBeenCalledWith(['good-url']);
  });

  it('alerts when all uploads fail or invalid', async () => {
    setImagesForTest(['']);

    const { result } = renderHook(() => useUploadImages());

    await act(async () => {
      await result.current.handleNext();
      await flushPromises();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Upload Failed',
      'All image uploads failed',
    );
  });
});
