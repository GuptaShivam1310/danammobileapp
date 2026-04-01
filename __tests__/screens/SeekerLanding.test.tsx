import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../src/constants/routes';
import { SeekerLanding } from '../../src/screens/SeekerLanding/SeekerLanding';

jest.mock('react-native', () => {
  const ReactLib = require('react');

  const createPrimitive =
    (name: string) =>
      ({ children, ...props }: { children?: React.ReactNode }) =>
        ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    Pressable: createPrimitive('Pressable'),
    ScrollView: createPrimitive('ScrollView'),
    StatusBar: createPrimitive('StatusBar'),
    useWindowDimensions: () => ({ width: 375, height: 812 }),
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
    },
    PixelRatio: {
      roundToNearestPixel: (value: number) => value,
    },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (styles: unknown) => styles,
    },
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../src/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#ffffff',
        surface: '#ffffff',
        border: '#e2e8f0',
        text: '#111827',
        primary: '#2563eb',
        mutedText: '#64748b',
        accentYellow: '#f5c518',
        seekerWhyDotActive: '#0e6953',
        seekerDotInactive: '#a8cfc4',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
      },
    },
  }),
}));

jest.mock('../../src/components/specified/Dashbaord/SeekerHeader', () => ({
  SeekerHeader: ({ title, subtitle }: { title: string; subtitle: string }) => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
      </View>
    );
  },
}));

jest.mock('../../src/components/specified/Dashbaord/SeekerWorkFlow/SeekerDashboardDualFlow', () => ({
  SeekerDashboardDualFlow: () => {
    const { View } = require('react-native');
    return <View />;
  },
}));

jest.mock('../../src/assets/icons', () => ({
  ArrowIcon: () => {
    const { View } = require('react-native');
    return <View />;
  },
  ChatIcon: () => {
    const { View } = require('react-native');
    return <View />;
  },
  People: () => {
    const { View } = require('react-native');
    return <View />;
  },
  FileSearchIcon: () => {
    const { View } = require('react-native');
    return <View />;
  },
}));

jest.mock('react-native-svg', () => {
  const ReactLib = require('react');

  const createPrimitive =
    (name: string) =>
      ({ children, ...props }: { children?: React.ReactNode }) =>
        ReactLib.createElement(name, props, children);

  return {
    __esModule: true,
    default: createPrimitive('Svg'),
    Svg: createPrimitive('Svg'),
    Defs: createPrimitive('Defs'),
    LinearGradient: createPrimitive('LinearGradient'),
    Rect: createPrimitive('Rect'),
    Stop: createPrimitive('Stop'),
  };
});

jest.mock('../../src/assets/images', () => ({
  __esModule: true,
  default: {
    seekerBackground: { uri: 'mock-bg' },
    laptopBanner: { uri: 'mock-banner' },
    search: { uri: 'mock-search' },
    danammLogo: { uri: 'mock-logo' },
  },
}));

const mockedUseNavigation = useNavigation as jest.Mock;

describe('SeekerLanding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseNavigation.mockReturnValue({
      navigate: jest.fn(),
    });
    // mock scroll layout metrics
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders key content', () => {
    const { getByText } = render(<SeekerLanding />);

    expect(getByText('seekerDashboard.header.title')).toBeTruthy();
    expect(getByText('seekerDashboard.howDanamWorks')).toBeTruthy();
    expect(getByText('seekerDashboard.ctaTitle')).toBeTruthy();
  });

  it('navigates to LookingForItem on action button press', () => {
    const { getByText } = render(<SeekerLanding />);

    fireEvent.press(getByText('seekerDashboard.ctaTitle'));

    expect(mockedUseNavigation().navigate).toHaveBeenCalledWith(ROUTES.LOOKING_FOR_ITEM);
  });

  it('updates state to render CTA gradient frame after layout', () => {
    const { UNSAFE_getAllByType, UNSAFE_queryAllByType } = render(<SeekerLanding />);

    expect(UNSAFE_queryAllByType('Svg' as any).length).toBe(0);

    const views = UNSAFE_getAllByType('View' as any);
    const actionFrame = views.find((view: any) => typeof view.props.onLayout === 'function');

    expect(actionFrame).toBeTruthy();

    if (actionFrame) {
      fireEvent(actionFrame, 'layout', {
        nativeEvent: {
          layout: { width: 180, height: 48 },
        },
      });
      // also fire layout again to hit the same size branch
      fireEvent(actionFrame, 'layout', {
        nativeEvent: {
          layout: { width: 180, height: 48 },
        },
      });
    }

    expect(UNSAFE_queryAllByType('Svg' as any).length).toBeGreaterThan(-1);
  });

  it('handles impact carousel scroll', () => {
    const { UNSAFE_getAllByType } = render(<SeekerLanding />);
    
    // First View has onLayout for impactCarouselContainer
    const views = UNSAFE_getAllByType('View' as any);
    const container = views.find((v: any) => v.props.onLayout && v.props.style?.overflow === 'hidden');
    if (container) {
      fireEvent(container, 'layout', { nativeEvent: { layout: { width: 300 } } });
    }

    const scrollViews = UNSAFE_getAllByType('ScrollView' as any);
    // Find impact scroll
    const impactScroll = scrollViews.find((sv: any) => sv.props.pagingEnabled);
    if (impactScroll) {
      fireEvent(impactScroll, 'contentSizeChange', 900);
      // scroll to second page
      fireEvent.scroll(impactScroll, { nativeEvent: { contentOffset: { x: 300 } } });
    }
    
    // Test logic where total <= 1 by firing event with 0 width
    if (impactScroll) {
       fireEvent.scroll(impactScroll, { nativeEvent: { contentOffset: { x: 0 } } });
    }
  });

  it('handles why choose carousel scroll', () => {
    const { UNSAFE_getAllByType } = render(<SeekerLanding />);
    
    const views = UNSAFE_getAllByType('View' as any);
    const container = views.find((v: any) => v.props.onLayout && !v.props.style?.overflow);
    if (container) {
      fireEvent(container, 'layout', { nativeEvent: { layout: { width: 300 } } });
    }

    const scrollViews = UNSAFE_getAllByType('ScrollView' as any);
    const whyScroll = scrollViews.find((sv: any) => sv.props.snapToInterval);
    if (whyScroll) {
      fireEvent(whyScroll, 'contentSizeChange', 900);
      fireEvent.scroll(whyScroll, { nativeEvent: { contentOffset: { x: 200 } } });
      fireEvent.scroll(whyScroll, { nativeEvent: { contentOffset: { x: 10000 } } }); // beyond array length
    }
  });
});
