import React from 'react';
import { render } from '@testing-library/react-native';
import { Loader } from '../../../../src/components/common/AppFlatlistLoader';
import { palette } from '../../../../src/constants/colors';

jest.mock('../../../../src/components/common/SvgIcon', () => ({
  SvgIcon: (props: any) => {
    const ReactLib = require('react');
    return ReactLib.createElement('View', { testID: 'svg-icon', ...props });
  }
}));

jest.mock('../../../../src/assets/images', () => ({
  LoaderIcon: 'LoaderIcon'
}));

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) => ReactLib.createElement(name, props, children);
  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    Image: createPrimitive('Image'),
    ActivityIndicator: createPrimitive('ActivityIndicator'),
    StyleSheet: { create: (s: any) => s, flatten: (s: any) => s },
  };
});

describe('AppFlatlistLoader', () => {
  it('renders default SvgIcon state correctly', () => {
    const { getByTestId, queryByTestId } = render(<Loader testID="loader-comp" />);
    expect(getByTestId('loader-comp')).toBeTruthy();
    expect(getByTestId('svg-icon')).toBeTruthy();
  });

  it('renders ActivityIndicator when useActivityIndicator is true', () => {
    const { getByTestId, queryByTestId, root } = render(<Loader testID="loader-comp" useActivityIndicator={true} />);
    expect(queryByTestId('svg-icon')).toBeNull();
    const activityIndicator = root.findByType('ActivityIndicator' as any);
    expect(activityIndicator).toBeTruthy();
  });

  it('renders ActivityIndicator when icon is null', () => {
    const { queryByTestId, root } = render(<Loader testID="loader-comp" icon={null} />);
    expect(queryByTestId('svg-icon')).toBeNull();
    const activityIndicator = root.findByType('ActivityIndicator' as any);
    expect(activityIndicator).toBeTruthy();
  });

  it('renders text with custom styles correctly', () => {
    const { getByText } = render(
        <Loader 
            text="Loading more..." 
            size={30} 
            color={'green'} 
        />
    );
    expect(getByText('Loading more...')).toBeTruthy();
  });
});
