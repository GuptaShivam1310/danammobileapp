import React from 'react';
import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import {
  SeekerDashboardDualFlow,
} from '../../../../../src/components/specified/Dashbaord/SeekerWorkFlow/SeekerDashboardDualFlow';
import {
  createSeekerDashboardDualFlowStyles,
  createStyles,
} from '../../../../../src/components/specified/Dashbaord/SeekerWorkFlow/seekerDashboardDualFlow.styles';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    StyleSheet: { create: (styles: any) => styles, flatten: (styles: any) => styles },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const themeMock = {
  colors: {
    splashBackground: '#0E7C66',
    text: '#111111',
    mutedText: '#666666',
  },
};

jest.mock('../../../../../src/theme', () => ({
  useTheme: () => ({ theme: themeMock }),
}));

const RightIcon = (props: any) => <right-icon {...props} />;
const LeftIcon = (props: any) => <left-icon {...props} />;

jest.mock('../../../../../src/assets/icons', () => ({
  DashBorderLeftIcon: (props: any) => <left-icon {...props} />,
  DashBorderRightIcon: (props: any) => <right-icon {...props} />,
}));

jest.mock(
  '../../../../../src/components/specified/Dashbaord/SeekerWorkFlow/seekerDashboardDualFlow.data',
  () => ({
    SEEKER_DUAL_FLOW_CARDS: [
      {
        id: 'post-browse',
        svgAsset: RightIcon,
        svgWidth: 100,
        svgHeight: 80,
        titlePrimaryKey: 'primary.one',
        titleSecondaryKey: 'secondary.one',
        descriptionKey: 'desc.one',
      },
      {
        id: 'express-interest',
        imageAsset: 'image-asset',
        svgWidth: 90,
        svgHeight: 70,
        titlePrimaryKey: 'primary.two',
        titleSecondaryKey: 'secondary.two',
        descriptionKey: 'desc.two',
      },
      {
        id: 'share-experience',
        svgAsset: LeftIcon,
        svgWidth: 110,
        svgHeight: 60,
        titlePrimaryKey: 'primary.three',
        titleSecondaryKey: 'secondary.three',
        descriptionKey: 'desc.three',
      },
    ],
  })
);

const flattenStyle = (style: any) =>
  (Array.isArray(style)
    ? style.flat().filter(Boolean).reduce((acc, item) => ({ ...acc, ...item }), {})
    : style) || {};

describe('SeekerDashboardDualFlow', () => {
  it('renders titles, descriptions, and connectors with mixed assets', () => {
    const { getByText, UNSAFE_getAllByType } = render(<SeekerDashboardDualFlow />);

    expect(getByText('primary.one')).toBeTruthy();
    expect(getByText('secondary.one')).toBeTruthy();
    expect(getByText('desc.one')).toBeTruthy();

    expect(getByText('primary.two')).toBeTruthy();
    expect(getByText('secondary.two')).toBeTruthy();
    expect(getByText('desc.two')).toBeTruthy();

    expect(getByText('primary.three')).toBeTruthy();
    expect(getByText('secondary.three')).toBeTruthy();
    expect(getByText('desc.three')).toBeTruthy();

    const images = UNSAFE_getAllByType(Image);
    expect(images.length).toBe(1);
    expect(images[0].props.source).toBe('image-asset');

    expect(UNSAFE_getAllByType('right-icon').length).toBe(2);
    expect(UNSAFE_getAllByType('left-icon').length).toBe(2);
  });

  it('builds styles with theme and top values', () => {
    const styles = createSeekerDashboardDualFlowStyles(themeMock as any);
    const container = flattenStyle(styles.container);
    const titlePrimary = flattenStyle(styles.titlePrimary);
    const description = flattenStyle(styles.description);

    expect(container.paddingTop).toBeDefined();
    expect(titlePrimary.color).toBe(themeMock.colors.splashBackground);
    expect(description.color).toBe(themeMock.colors.mutedText);

    const dynamicStyles = createStyles(152);
    const left = flattenStyle(dynamicStyles.leftConnectorWrap);
    const right = flattenStyle(dynamicStyles.rightConnectorWrap);
    expect(left.top).toBeDefined();
    expect(right.top).toBeDefined();
  });
});
