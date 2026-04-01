import React from 'react';
import { render } from '@testing-library/react-native';
import { Image, ImageBackground } from 'react-native';
import { SeekerHeader } from '../../../../src/components/specified/Dashbaord/SeekerHeader';
import { createSeekerHeaderStyles } from '../../../../src/components/specified/Dashbaord/SeekerHeader/seekerHeader.styles';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    ImageBackground: createPrimitive('ImageBackground'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

const themeMock = {
  colors: { splashBackground: '#0E7C66', surface: '#FFFFFF', accentYellow: '#F5C518' },
  spacing: { lg: 24 },
};

jest.mock('../../../../src/theme', () => ({
  useTheme: () => ({ theme: themeMock }),
}));

jest.mock('../../../../src/assets/images', () => ({
  __esModule: true,
  default: {
    seekerBackground: 'bg-image',
    logo: 'logo-image',
  },
}));

const flattenStyle = (style: any) =>
  (Array.isArray(style)
    ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {})
    : style) || {};

describe('SeekerHeader', () => {
  it('renders title/subtitle and uses images/styles', () => {
    const { getByText, UNSAFE_getByType } = render(
      <SeekerHeader title="Welcome" subtitle="Find help" />
    );

    expect(getByText('Welcome')).toBeTruthy();
    expect(getByText('Find help')).toBeTruthy();

    const bg = UNSAFE_getByType(ImageBackground);
    expect(bg.props.source).toBe('bg-image');

    const logo = UNSAFE_getByType(Image);
    expect(logo.props.source).toBe('logo-image');
  });

  it('builds styles with theme values', () => {
    const styles = createSeekerHeaderStyles(themeMock as any);
    const container = flattenStyle(styles.headerContainer);
    const content = flattenStyle(styles.headerContent);
    const title = flattenStyle(styles.title);
    const subtitle = flattenStyle(styles.subtitle);

    expect(container.backgroundColor).toBe(themeMock.colors.splashBackground);
    expect(content.paddingHorizontal).toBe(themeMock.spacing.lg);
    expect(title.color).toBe(themeMock.colors.surface);
    expect(subtitle.color).toBe(themeMock.colors.accentYellow);
  });
});
