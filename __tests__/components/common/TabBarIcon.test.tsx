import React from 'react';
import { render } from '@testing-library/react-native';
import { TabBarIcon } from '../../../src/components/common/TabBarIcon';

jest.mock('react-native-svg', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) =>
    (props: any) => ReactLib.createElement(name, props, props.children);

  return {
    __esModule: true,
    default: createPrimitive('Svg'),
    Svg: createPrimitive('Svg'),
    Defs: createPrimitive('Defs'),
    LinearGradient: createPrimitive('LinearGradient'),
    Stop: createPrimitive('Stop'),
    Circle: createPrimitive('Circle'),
  };
});

const DummyIcon = (props: any) => <svg {...props} />;

describe('TabBarIcon', () => {
  it('renders focused icon with gradient border', () => {
    const { toJSON } = render(
      <TabBarIcon icon={DummyIcon} isFocused isMiddle={false} />
    );

    expect(toJSON()).toBeTruthy();
  });

  it('renders middle icon variant', () => {
    const { toJSON } = render(
      <TabBarIcon icon={DummyIcon} isFocused={false} isMiddle />
    );

    expect(toJSON()).toBeTruthy();
  });
});
