import React from 'react';
import { render } from '@testing-library/react-native';
import { SvgIcon } from '../../../src/components/common/SvgIcon';

describe('SvgIcon', () => {
  it('passes default size and omits fill/stroke when color is not provided', () => {
    const Icon = jest.fn(() => null);

    render(<SvgIcon icon={Icon} testID="svg-icon" />);

    expect(Icon).toHaveBeenCalledTimes(1);
    const props = Icon.mock.calls[0][0];

    expect(props.width).toBe(24);
    expect(props.height).toBe(24);
    expect(props.fill).toBeUndefined();
    expect(props.stroke).toBeUndefined();
    expect(props.testID).toBe('svg-icon');
  });

  it('passes custom size, color, style, and extra props through', () => {
    const Icon = jest.fn(() => null);

    render(
      <SvgIcon
        icon={Icon}
        size={32}
        color="#FF0000"
        style={{ opacity: 0.7 }}
        testID="custom-icon"
        accessibilityLabel="custom-icon"
      />
    );

    expect(Icon).toHaveBeenCalledTimes(1);
    const props = Icon.mock.calls[0][0];

    expect(props.width).toBe(32);
    expect(props.height).toBe(32);
    expect(props.fill).toBe('#FF0000');
    expect(props.stroke).toBe('#FF0000');
    expect(props.style).toEqual({ opacity: 0.7 });
    expect(props.testID).toBe('custom-icon');
    expect(props.accessibilityLabel).toBe('custom-icon');
  });
});
