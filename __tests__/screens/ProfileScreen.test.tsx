import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProfileScreen } from '../../src/screens/Profile/ProfileScreen';
import { useProfile } from '../../src/screens/Profile/useProfile';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    TouchableOpacity: createPrimitive('TouchableOpacity'),
    ScrollView: createPrimitive('ScrollView'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    Image: createPrimitive('Image'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
    Platform: {
      OS: 'ios',
      select: (obj: any) => obj.ios,
    },
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('Svg', props, props.children),
    Svg: (props: any) => React.createElement('Svg', props, props.children),
    Path: (props: any) => React.createElement('Path', props, props.children),
  };
});

jest.mock('../../src/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        text: '#000',
        brandGreen: '#0B6B4F',
        mutedText: '#666',
        surface: '#FFF',
        border: '#EEE',
      },
    },
  }),
}));

jest.mock('../../src/theme/scale', () => ({
  scale: (val: number) => val,
  moderateScale: (val: number) => val,
  verticalScale: (val: number) => val,
  normalize: (val: number) => val,
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
  ScreenWrapper: ({ children, testID }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID }, children);
  },
}));

jest.mock('../../src/components/common/LogoutModal', () => ({
  LogoutModal: 'LogoutModal',
}));

jest.mock('../../src/components/common/SvgIcon', () => ({
  SvgIcon: ({ icon, ...props }: any) => {
    const React = require('react');
    return React.createElement('SvgIcon', { icon, ...props });
  },
}));

const baseProfileMock = {
  profile: {
    full_name: 'Stellina Harper',
    email: 'stellina.harper@gmail.com',
    profile_image_url: 'test-image-url',
  },
  isLoading: false,
  isSeekerUserType: true,
  handleEditProfile: jest.fn(),
  handleMyReceivedGoods: jest.fn(),
  handleSettings: jest.fn(),
  handleChangePassword: jest.fn(),
  handleHelpSupport: jest.fn(),
  handleLogout: jest.fn(),
  isLogoutModalVisible: false,
  closeLogoutModal: jest.fn(),
  handleConfirmLogout: jest.fn(),
};

jest.mock('../../src/screens/Profile/useProfile', () => ({
  useProfile: jest.fn(),
}));

const mockUseProfile = useProfile as jest.Mock;

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProfile.mockReturnValue({ ...baseProfileMock });
  });

  it('renders header and user details', () => {
    const { getByTestId, getByText } = render(<ProfileScreen />);

    expect(getByTestId('profile-screen')).toBeTruthy();
    expect(getByTestId('profile-header-title')).toBeTruthy();
    expect(getByText('Stellina Harper')).toBeTruthy();
    expect(getByText('stellina.harper@gmail.com')).toBeTruthy();
  });

  it('shows loading state when profile is not ready', () => {
    mockUseProfile.mockReturnValue({
      ...baseProfileMock,
      profile: null,
      isLoading: true,
    });

    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('profile-screen')).toBeNull();
  });

  it('renders fallback user data when profile is missing', () => {
    mockUseProfile.mockReturnValue({
      ...baseProfileMock,
      profile: null,
      isLoading: false,
    });

    const { getByText } = render(<ProfileScreen />);
    expect(getByText('User Name')).toBeTruthy();
    expect(getByText('user@example.com')).toBeTruthy();
  });

  it('renders My Received Goods option for seeker', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-item-my-received-goods')).toBeTruthy();
  });

  it('hides My Received Goods option for non-seeker', () => {
    mockUseProfile.mockReturnValue({
      ...baseProfileMock,
      isSeekerUserType: false,
    });

    const { queryByTestId } = render(<ProfileScreen />);
    expect(queryByTestId('profile-item-my-received-goods')).toBeNull();
  });

  it('triggers handleEditProfile when Edit Profile button is pressed', () => {
    const { getByTestId } = render(<ProfileScreen />);
    fireEvent.press(getByTestId('profile-edit-button'));
    expect(baseProfileMock.handleEditProfile).toHaveBeenCalled();
  });

  it('triggers option handlers on press', () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('profile-item-my-received-goods'));
    fireEvent.press(getByTestId('profile-item-settings'));
    fireEvent.press(getByTestId('profile-item-change-password'));
    fireEvent.press(getByTestId('profile-item-help-support'));
    fireEvent.press(getByTestId('profile-item-logout'));

    expect(baseProfileMock.handleMyReceivedGoods).toHaveBeenCalled();
    expect(baseProfileMock.handleSettings).toHaveBeenCalled();
    expect(baseProfileMock.handleChangePassword).toHaveBeenCalled();
    expect(baseProfileMock.handleHelpSupport).toHaveBeenCalled();
    expect(baseProfileMock.handleLogout).toHaveBeenCalled();
  });

  it('renders version text', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('profile-version-text')).toBeTruthy();
  });
});
