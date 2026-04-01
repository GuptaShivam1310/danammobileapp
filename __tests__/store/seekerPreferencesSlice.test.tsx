import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import seekerPreferencesReducer, {
  setLookingFor,
  setGender,
  setDateOfBirth,
  setProfessionId,
  setLocation,
  setReason,
  setReferralSource,
  resetSeekerPreferences,
} from '../../src/store/slices/seekerPreferencesSlice';
import { act, render } from '@testing-library/react-native';

jest.mock('react-native', () => {
  const ReactLib = require('react');
  const createPrimitive = (name: string) => ({ children, ...props }: any) =>
    ReactLib.createElement(name, props, children);
  return {
    View: createPrimitive('View'),
    Text: createPrimitive('Text'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (styles: any) => styles,
    },
  };
});

const initialPreferences = {
  looking_for: '',
  gender: '',
  date_of_birth: '',
  profession_id: null,
  location: {
    latitude: null,
    longitude: null,
    address: '',
  },
  reason: '',
  referral_source: '',
};

const makeStore = () =>
  configureStore({
    reducer: {
      seekerPreferences: seekerPreferencesReducer,
    },
  });

const PreferencesViewer = () => {
  const { View, Text } = require('react-native');
  const prefs = useSelector((state: any) => state.seekerPreferences.preferences);
  return (
    <View>
      <Text testID="looking_for">{prefs.looking_for}</Text>
      <Text testID="gender">{prefs.gender}</Text>
      <Text testID="dob">{prefs.date_of_birth}</Text>
      <Text testID="profession_id">{String(prefs.profession_id)}</Text>
      <Text testID="location">
        {`${prefs.location.latitude ?? ''},${prefs.location.longitude ?? ''},${prefs.location.address}`}
      </Text>
      <Text testID="reason">{prefs.reason}</Text>
      <Text testID="referral_source">{prefs.referral_source}</Text>
    </View>
  );
};

describe('seekerPreferencesSlice', () => {
  it('returns initial state', () => {
    const state = seekerPreferencesReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ preferences: initialPreferences });
  });

  it('setLookingFor updates looking_for', () => {
    const state = seekerPreferencesReducer(undefined, setLookingFor('Food'));
    expect(state.preferences.looking_for).toBe('Food');
  });

  it('setGender updates gender', () => {
    const state = seekerPreferencesReducer(undefined, setGender('female'));
    expect(state.preferences.gender).toBe('female');
  });

  it('setDateOfBirth updates date_of_birth', () => {
    const state = seekerPreferencesReducer(undefined, setDateOfBirth('1995-02-10'));
    expect(state.preferences.date_of_birth).toBe('1995-02-10');
  });

  it('setProfessionId updates profession_id', () => {
    const state = seekerPreferencesReducer(undefined, setProfessionId(12));
    expect(state.preferences.profession_id).toBe(12);
  });

  it('setLocation updates location', () => {
    const location = { latitude: 10, longitude: 20, address: 'Test St' };
    const state = seekerPreferencesReducer(undefined, setLocation(location));
    expect(state.preferences.location).toEqual(location);
  });

  it('setReason updates reason', () => {
    const state = seekerPreferencesReducer(undefined, setReason('Because I need help'));
    expect(state.preferences.reason).toBe('Because I need help');
  });

  it('setReferralSource updates referral_source', () => {
    const state = seekerPreferencesReducer(undefined, setReferralSource('Social Media'));
    expect(state.preferences.referral_source).toBe('Social Media');
  });

  it('resetSeekerPreferences restores initial values', () => {
    const seeded = seekerPreferencesReducer(undefined, setLookingFor('Clothes'));
    const state = seekerPreferencesReducer(seeded, resetSeekerPreferences());
    expect(state.preferences).toEqual(initialPreferences);
  });

  it('component reflects updates from store actions', () => {
    const store = makeStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <PreferencesViewer />
      </Provider>
    );

    expect(getByTestId('looking_for').props.children).toBe('');
    expect(getByTestId('profession_id').props.children).toBe('null');

    act(() => {
      store.dispatch(setLookingFor('Shelter'));
      store.dispatch(setGender('male'));
      store.dispatch(setDateOfBirth('2000-01-01'));
      store.dispatch(setProfessionId(3));
      store.dispatch(setLocation({ latitude: 1, longitude: 2, address: 'Street 1' }));
      store.dispatch(setReason('Need support'));
      store.dispatch(setReferralSource('Friend'));
    });

    expect(getByTestId('looking_for').props.children).toBe('Shelter');
    expect(getByTestId('gender').props.children).toBe('male');
    expect(getByTestId('dob').props.children).toBe('2000-01-01');
    expect(getByTestId('profession_id').props.children).toBe('3');
    expect(getByTestId('location').props.children).toBe('1,2,Street 1');
    expect(getByTestId('reason').props.children).toBe('Need support');
    expect(getByTestId('referral_source').props.children).toBe('Friend');

    act(() => {
      store.dispatch(resetSeekerPreferences());
    });

    expect(getByTestId('looking_for').props.children).toBe('');
    expect(getByTestId('gender').props.children).toBe('');
    expect(getByTestId('dob').props.children).toBe('');
    expect(getByTestId('profession_id').props.children).toBe('null');
    expect(getByTestId('location').props.children).toBe(',,');
    expect(getByTestId('reason').props.children).toBe('');
    expect(getByTestId('referral_source').props.children).toBe('');
  });
});
