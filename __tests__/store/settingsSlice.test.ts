import settingsReducer, {
    setThemeMode,
    setLocale,
    setOnboardingSeen,
} from '../../src/store/slices/settingsSlice';

describe('settingsSlice', () => {
    const initialState = {
        themeMode: 'system',
        locale: 'en',
        hasSeenOnboarding: false,
    };

    it('should return the initial state', () => {
        expect(settingsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setThemeMode to light', () => {
        const state = settingsReducer(initialState, setThemeMode('light'));
        expect(state.themeMode).toBe('light');
    });

    it('should handle setThemeMode to dark', () => {
        const state = settingsReducer(initialState, setThemeMode('dark'));
        expect(state.themeMode).toBe('dark');
    });

    it('should handle setThemeMode to system', () => {
        const state = settingsReducer({ ...initialState, themeMode: 'dark' }, setThemeMode('system'));
        expect(state.themeMode).toBe('system');
    });

    it('should handle setLocale', () => {
        const state = settingsReducer(initialState, setLocale('ar'));
        expect(state.locale).toBe('ar');
    });

    it('should handle setOnboardingSeen to true', () => {
        const state = settingsReducer(initialState, setOnboardingSeen(true));
        expect(state.hasSeenOnboarding).toBe(true);
    });

    it('should handle setOnboardingSeen to false', () => {
        const state = settingsReducer({ ...initialState, hasSeenOnboarding: true }, setOnboardingSeen(false));
        expect(state.hasSeenOnboarding).toBe(false);
    });
});
