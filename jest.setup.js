globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native/Libraries/Image/Image', () => {
  const React = require('react');
  return props => React.createElement('Image', props);
});

jest.mock('react-native/Libraries/Text/Text', () => {
  const React = require('react');
  return ({ children, ...props }) =>
    React.createElement('Text', props, children);
});
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: props => React.createElement('Svg', props),
    Path: props => React.createElement('Path', props),
    Circle: props => React.createElement('Circle', props),
    Rect: props => React.createElement('Rect', props),
    G: props => React.createElement('G', props),
    Defs: props => React.createElement('Defs', props),
    LinearGradient: props => React.createElement('LinearGradient', props),
    Stop: props => React.createElement('Stop', props),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-vector-icons/Feather', () => ({
  __esModule: true,
  default: 'FeatherIcon',
}));
jest.mock('react-native-vector-icons/Ionicons', () => ({
  __esModule: true,
  default: 'IoniconsIcon',
}));
jest.mock('react-native-vector-icons/MaterialIcons', () => ({
  __esModule: true,
  default: 'MaterialIcon',
}));
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  __esModule: true,
  default: 'MaterialCommunityIcon',
}));
jest.mock('react-native-vector-icons/FontAwesome', () => ({
  __esModule: true,
  default: 'FontAwesomeIcon',
}));

jest.mock('react-native-config', () => ({
  REQUEST_TIMEOUT: '10000',
  API_URL: 'http://localhost:3000',
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const BottomSheetModal = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
    }));
    return React.createElement('BottomSheetModal', props, props.children);
  });
  const BottomSheetBackdrop = props =>
    React.createElement('BottomSheetBackdrop', props);
  const BottomSheetView = props =>
    React.createElement('BottomSheetView', props, props.children);
  const BottomSheetModalProvider = ({ children }) =>
    React.createElement('BottomSheetModalProvider', null, children);

  return {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetModalProvider,
  };
});

jest.mock('./src/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        softSurface: '#F4FAF6',
        text: '#000000',
        mutedText: '#666666',
        border: '#D1D5DB',
        primary: '#2196F3',
        danger: '#DC2626',
        success: '#16A34A',
        brandGreen: '#0B6B4F',
        seekerGreen: '#0E6953',
        seekerGreenLight: '#CFE1DD',
      },
      typography: {
        fontFamilyBold: 'System',
        fontFamilyRegular: 'System',
        fontFamilyMedium: 'System',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
    isDark: false,
    toggleTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}));

jest.mock('./src/theme/scale', () => ({
  scale: size => size,
  verticalScale: size => size,
  moderateScale: size => size,
  normalize: size => size,
}));
jest.mock(
  '@react-native-documents/picker',
  () => ({
    pick: jest.fn(),
    isErrorWithCode: jest.fn(),
    errorCodes: {
      OPERATION_CANCELED: 'OPERATION_CANCELED',
    },
    types: {
      allFiles: 'allFiles',
    },
  }),
  { virtual: true },
);

jest.mock('react-native-maps', () => {
  const React = require('react');
  const MapView = props =>
    React.createElement('MapView', props, props.children);
  const Marker = props => React.createElement('Marker', props, props.children);
  return {
    __esModule: true,
    default: MapView,
    Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('./src/services/locationService', () => ({
  getAddressFromCoords: jest.fn(() =>
    Promise.resolve({
      fullAddress: 'Mock Address',
      area: 'Mock Area',
      city: 'Mock City',
      latitude: 0,
      longitude: 0,
    }),
  ),
}));

jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const FastImage = props => React.createElement('FastImage', props);
  FastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  FastImage.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  FastImage.cacheControl = {
    immutable: 'immutable',
    web: 'web',
    cacheOnly: 'cacheOnly',
  };
  return {
    __esModule: true,
    default: FastImage,
  };
}, { virtual: true });
