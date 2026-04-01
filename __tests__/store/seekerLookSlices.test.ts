import { configureStore } from '@reduxjs/toolkit';
import seekerLookReducer, { fetchSeekerLookItems } from '../../src/store/slices/seekerLookSlice';
import seekerLookProfessionReducer, { fetchSeekerLookProfessions } from '../../src/store/slices/seekerLookProfession';
import seekerLookDoYouReducer, { fetchSeekerLookDoYouOptions } from '../../src/store/slices/seekerLookDoYouSlice';
import { seekerLookApi } from '../../src/services/api/seekerLookApi';

jest.mock('../../src/services/api/seekerLookApi', () => ({
  seekerLookApi: {
    getItems: jest.fn(),
    getProfessions: jest.fn(),
    getDoYouOptions: jest.fn(),
  },
}));

describe('seekerLook slices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches seeker look items', async () => {
    (seekerLookApi.getItems as jest.Mock).mockResolvedValueOnce([{ id: 1, title: 'A' }]);

    const store = configureStore({ reducer: { seekerLook: seekerLookReducer } });
    await store.dispatch(fetchSeekerLookItems());

    expect(store.getState().seekerLook.items).toEqual([{ id: 1, title: 'A' }]);
  });

  it('handles seeker look items error state with message', async () => {
    (seekerLookApi.getItems as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const store = configureStore({ reducer: { seekerLook: seekerLookReducer } });

    await store.dispatch(fetchSeekerLookItems());

    expect(store.getState().seekerLook.error).toBe('fail');
    expect(store.getState().seekerLook.isLoading).toBe(false);
  });

  it('sets loading on pending and uses fallback error when payload missing', () => {
    const pendingState = seekerLookReducer(undefined, { type: fetchSeekerLookItems.pending.type });
    expect(pendingState.isLoading).toBe(true);
    expect(pendingState.error).toBeNull();

    const rejectedState = seekerLookReducer(pendingState as any, {
      type: fetchSeekerLookItems.rejected.type,
      payload: undefined,
    });
    expect(rejectedState.error).toBe('Failed to fetch item list');
  });

  it('uses fallback error when message is missing', async () => {
    (seekerLookApi.getItems as jest.Mock).mockRejectedValueOnce({});
    const store = configureStore({ reducer: { seekerLook: seekerLookReducer } });

    await store.dispatch(fetchSeekerLookItems());

    expect(store.getState().seekerLook.error).toBe('Failed to fetch item list');
  });

  it('fetches professions and handles errors', async () => {
    (seekerLookApi.getProfessions as jest.Mock).mockResolvedValueOnce([{ id: 2, title: 'B' }]);
    const store = configureStore({ reducer: { seekerLookProfession: seekerLookProfessionReducer } });
    await store.dispatch(fetchSeekerLookProfessions());
    expect(store.getState().seekerLookProfession.professions).toEqual([{ id: 2, title: 'B' }]);

    (seekerLookApi.getProfessions as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await store.dispatch(fetchSeekerLookProfessions());
    expect(store.getState().seekerLookProfession.error).toBe('fail');
  });

  it('handles professions pending and rejected fallback', () => {
    const pendingState = seekerLookProfessionReducer(undefined, { type: fetchSeekerLookProfessions.pending.type });
    expect(pendingState.isLoading).toBe(true);
    expect(pendingState.error).toBeNull();

    const rejectedState = seekerLookProfessionReducer(pendingState as any, {
      type: fetchSeekerLookProfessions.rejected.type,
      payload: undefined,
    });
    expect(rejectedState.error).toBe('Failed to fetch profession list');
  });

  it('fetches do you options and handles errors', async () => {
    (seekerLookApi.getDoYouOptions as jest.Mock).mockResolvedValueOnce([{ id: 3, title: 'C' }]);
    const store = configureStore({ reducer: { seekerLookDoYou: seekerLookDoYouReducer } });
    await store.dispatch(fetchSeekerLookDoYouOptions());
    expect(store.getState().seekerLookDoYou.options).toEqual([{ id: 3, title: 'C' }]);

    (seekerLookApi.getDoYouOptions as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await store.dispatch(fetchSeekerLookDoYouOptions());
    expect(store.getState().seekerLookDoYou.error).toBe('fail');
  });

  it('handles do you options pending and rejected fallback', () => {
    const pendingState = seekerLookDoYouReducer(undefined, { type: fetchSeekerLookDoYouOptions.pending.type });
    expect(pendingState.isLoading).toBe(true);
    expect(pendingState.error).toBeNull();

    const rejectedState = seekerLookDoYouReducer(pendingState as any, {
      type: fetchSeekerLookDoYouOptions.rejected.type,
      payload: undefined,
    });
    expect(rejectedState.error).toBe('Failed to fetch options');
  });
});
