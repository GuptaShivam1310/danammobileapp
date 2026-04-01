import { configureStore } from '@reduxjs/toolkit';
import profileReducer, {
  deleteProfileThunk,
  fetchProfile,
  resetProfileState,
  updateProfile,
} from '../../src/store/slices/profileSlice';
import { profileApi } from '../../src/services/api/profileApi';

jest.mock('../../src/services/api/profileApi', () => ({
  profileApi: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

describe('profileSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches profile successfully and handles error', async () => {
    (profileApi.getProfile as jest.Mock).mockResolvedValueOnce({ success: true, data: { id: '1' } });
    const store = configureStore({ reducer: { profile: profileReducer } });

    await store.dispatch(fetchProfile());
    expect(store.getState().profile.user).toEqual({ id: '1' });

    (profileApi.getProfile as jest.Mock).mockResolvedValueOnce({ success: false, message: 'fail' });
    await store.dispatch(fetchProfile());
    expect(store.getState().profile.error).toBe('fail');
  });

  it('fetchProfile handles thrown error', async () => {
    (profileApi.getProfile as jest.Mock).mockRejectedValueOnce(new Error('network'));
    const store = configureStore({ reducer: { profile: profileReducer } });

    await store.dispatch(fetchProfile());
    expect(store.getState().profile.error).toBe('network');
  });

  it('updates profile and handles error', async () => {
    (profileApi.updateProfile as jest.Mock).mockResolvedValueOnce({ success: true, data: { id: '2' } });
    const store = configureStore({ reducer: { profile: profileReducer } });

    await store.dispatch(updateProfile({ full_name: 'User' } as any));
    expect(store.getState().profile.user).toEqual({ id: '2' });

    (profileApi.updateProfile as jest.Mock).mockResolvedValueOnce({ success: false, message: 'fail' });
    await store.dispatch(updateProfile({ full_name: 'User' } as any));
    expect(store.getState().profile.error).toBe('fail');
  });

  it('updateProfile handles thrown error', async () => {
    (profileApi.updateProfile as jest.Mock).mockRejectedValueOnce(new Error('oops'));
    const store = configureStore({ reducer: { profile: profileReducer } });

    await store.dispatch(updateProfile({ full_name: 'User' } as any));
    expect(store.getState().profile.error).toBe('oops');
  });

  it('deletes profile and handles error', async () => {
    (profileApi.deleteUser as jest.Mock).mockResolvedValueOnce({ success: true, message: 'ok' });
    const store = configureStore({ reducer: { profile: profileReducer } });

    await store.dispatch(deleteProfileThunk());
    expect(store.getState().profile.user).toBeNull();

    (profileApi.deleteUser as jest.Mock).mockResolvedValueOnce({ success: false, message: 'fail' });
    await store.dispatch(deleteProfileThunk());
    expect(store.getState().profile.error).toBe('fail');
  });

  it('deleteProfileThunk handles thrown error', async () => {
    (profileApi.deleteUser as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    const store = configureStore({ reducer: { profile: profileReducer } });

    await store.dispatch(deleteProfileThunk());
    expect(store.getState().profile.error).toBe('boom');
  });

  it('resets profile state', () => {
    const store = configureStore({ reducer: { profile: profileReducer } });
    store.dispatch(resetProfileState());
    expect(store.getState().profile).toEqual({ user: null, isLoading: false, error: null });
  });
});
