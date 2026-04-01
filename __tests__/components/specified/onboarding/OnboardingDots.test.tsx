import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeviceEventEmitter } from 'react-native';
import { OnboardingDots } from '../../../../src/components/specified/onboarding/OnboardingDots';

jest.mock('../../../../src/screens/Onboarding/styles', () => ({
  onboardingStyles: { dotsContainer: { padding: 1 }, dot: { width: 6 }, dotActive: { width: 10 } }
}));

describe('OnboardingDots', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correct number of dots and handles press', () => {
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');
    const { getByTestId } = render(
      <OnboardingDots total={3} activeIndex={1} />
    );
    
    expect(getByTestId('dot-0')).toBeTruthy();
    expect(getByTestId('dot-1')).toBeTruthy();
    expect(getByTestId('dot-2')).toBeTruthy();
    
    fireEvent.press(getByTestId('dot-2'));
    expect(emitSpy).toHaveBeenCalledWith('onboarding_dot_press', 2);
    
    emitSpy.mockRestore();
  });

  it('applies active style and removes left margin for first dot', () => {
    const { getByTestId } = render(
      <OnboardingDots total={2} activeIndex={0} />
    );

    const firstDot = getByTestId('dot-0');
    const secondDot = getByTestId('dot-1');

    expect(firstDot.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 6 }),
        expect.objectContaining({ marginLeft: 0 }),
        expect.objectContaining({ width: 10 }),
      ])
    );
    expect(secondDot.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 6 }),
        null,
        null,
      ])
    );
  });
});
