import React from 'react';
import { View } from 'react-native';
const SvgMock = (props) => React.createElement(View, { ...props, testID: 'svg-mock' });
export default SvgMock;
export const ReactComponent = SvgMock;
