describe('store rootReducer', () => {
  const createFreshStore = () => {
    jest.resetModules();
    let store: any;
    let actions: any;
    jest.isolateModules(() => {
      const storeModule = require('../../src/store');
      store = storeModule.store;
      actions = {
        setThemeMode: require('../../src/store/slices/settingsSlice').setThemeMode,
        setLocale: require('../../src/store/slices/settingsSlice').setLocale,
        setOnboardingSeen: require('../../src/store/slices/settingsSlice').setOnboardingSeen,
        addRecentSearch: require('../../src/store/slices/searchSlice').addRecentSearch,
        setCredentials: require('../../src/store/slices/authSlice').setCredentials,
        clearAuthState: require('../../src/store/slices/authSlice').clearAuthState,
        logoutUser: require('../../src/store/slices/authSlice').logoutUser,
      };
    });

    return { store, actions };
  };

  it('preserves settings and resets other slices on logoutUser.fulfilled', () => {
    const { store, actions } = createFreshStore();

    store.dispatch(actions.setThemeMode('dark'));
    store.dispatch(actions.setLocale('ar'));
    store.dispatch(actions.setOnboardingSeen(true));
    store.dispatch(actions.addRecentSearch('Shoes'));
    store.dispatch(actions.setCredentials({ token: 't', user: { id: 'u1' } }));

    store.dispatch(actions.logoutUser.fulfilled(undefined, 'req'));

    const state = store.getState();
    expect(state.settings.themeMode).toBe('dark');
    expect(state.settings.locale).toBe('ar');
    expect(state.settings.hasSeenOnboarding).toBe(true);
    expect(state.search.recentSearches).toEqual([]);
    expect(state.auth.isAuthenticated).toBe(false);
  });

  it('preserves settings on clearAuthState', () => {
    const { store, actions } = createFreshStore();

    store.dispatch(actions.setThemeMode('light'));
    store.dispatch(actions.addRecentSearch('Bags'));

    store.dispatch(actions.clearAuthState());

    const state = store.getState();
    expect(state.settings.themeMode).toBe('light');
    expect(state.search.recentSearches).toEqual([]);
  });

  it('does not reset state on unrelated actions', () => {
    const { store, actions } = createFreshStore();

    store.dispatch(actions.addRecentSearch('A'));
    store.dispatch(actions.setThemeMode('dark'));

    const state = store.getState();
    expect(state.search.recentSearches).toEqual(['A']);
    expect(state.settings.themeMode).toBe('dark');
  });
});
