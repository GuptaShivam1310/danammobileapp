import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SeekerPreferences {
    looking_for: string;
    gender: string;
    date_of_birth: string;
    profession_id: number | null;
    location: {
        latitude: number | null;
        longitude: number | null;
        address: string;
    };
    reason: string;
    referral_source: string;
}

interface SeekerPreferencesState {
    preferences: SeekerPreferences;
}

const initialState: SeekerPreferencesState = {
    preferences: {
        looking_for: "",
        gender: "",
        date_of_birth: "",
        profession_id: null,
        location: {
            latitude: null,
            longitude: null,
            address: ""
        },
        reason: "",
        referral_source: ""
    }
};

const seekerPreferencesSlice = createSlice({
    name: 'seekerPreferences',
    initialState,
    reducers: {
        setLookingFor: (state, action: PayloadAction<string>) => {
            state.preferences.looking_for = action.payload;
        },
        setGender: (state, action: PayloadAction<string>) => {
            state.preferences.gender = action.payload;
        },
        setDateOfBirth: (state, action: PayloadAction<string>) => {
            state.preferences.date_of_birth = action.payload;
        },
        setProfessionId: (state, action: PayloadAction<number | null>) => {
            state.preferences.profession_id = action.payload;
        },
        setLocation: (state, action: PayloadAction<{ latitude: number | null, longitude: number | null, address: string }>) => {
            state.preferences.location = action.payload;
        },
        setReason: (state, action: PayloadAction<string>) => {
            state.preferences.reason = action.payload;
        },
        setReferralSource: (state, action: PayloadAction<string>) => {
            state.preferences.referral_source = action.payload;
        },
        resetSeekerPreferences: (state) => {
            state.preferences = initialState.preferences;
        }
    }
});

export const {
    setLookingFor,
    setGender,
    setDateOfBirth,
    setProfessionId,
    setLocation,
    setReason,
    setReferralSource,
    resetSeekerPreferences
} = seekerPreferencesSlice.actions;

export default seekerPreferencesSlice.reducer;
