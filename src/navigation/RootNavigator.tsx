import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { RootStackParamList } from '../models/navigation';

import { ONBOARDING_STORAGE_KEY } from '../screens/Onboarding/data';
import { useAppDispatch, useAppSelector } from '../store';
import { hydrateAuth } from '../store/slices/authSlice';
import { setOnboardingSeen } from '../store/slices/settingsSlice';
import { useTheme } from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { HomeNavigator } from './HomeNavigator';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { SeekerLandingNavigator } from './seekerNavigator';
import { LoginScreen } from '../screens/Login/LoginScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPassword/ForgotPasswordScreen';
import { ResetPasswordSuccessScreen } from '../screens/ResetPasswordSuccess/ResetPasswordSuccessScreen';
import { ResetPasswordScreen } from '../screens/ResetPassword/ResetPasswordScreen';

import { SocketProvider } from './SocketProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

function isSeekerUserType(userType?: string) {
  return userType?.trim().toLowerCase().startsWith('seeker') ?? false;
}

export function RootNavigator() {
  const dispatch = useAppDispatch();
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Select auth and onboarding state
  const { isAuthenticated, isLoading: isAuthLoading, user: authUser } = useAppSelector(
    state => state.auth
  );
  const { hasSeenOnboarding } = useAppSelector(state => state.settings);

  const { theme } = useTheme();

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(hydrateAuth());

        const onboardingValue = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        dispatch(setOnboardingSeen(onboardingValue === 'true'));
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (isInitializing) return null;

  const renderMainStack = () => {
    if (isAuthenticated) {
      const userType = authUser?.role;
      if (isSeekerUserType(userType)) {
        const isPreferencesSaved = authUser?.is_preferences_saved ?? false;
        return (
          <Stack.Screen name={ROUTES.SEKKER_STACK}>
            {() => (
              <SeekerLandingNavigator hasLookingForFlowData={isPreferencesSaved} />
            )}
          </Stack.Screen>
        );
      }

      return (
        <Stack.Screen
          name={ROUTES.APP_DRAWER}
          component={HomeNavigator}
        />
      );
    }

    if (!hasSeenOnboarding) {
      return (
        <>
          <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
          <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
          <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
          <Stack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
          <Stack.Screen
            name={ROUTES.RESET_PASSWORD_SUCCESS}
            component={ResetPasswordSuccessScreen}
          />
        </>
      );
    }

    return (
      <Stack.Screen
        name={ROUTES.AUTH_STACK}
        component={AuthNavigator}
      />
    );
  };

  return (
    <SocketProvider>
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background,
            card: theme.colors.surface,
            border: theme.colors.border,
            text: theme.colors.text,
            primary: theme.colors.primary,
          },
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {renderMainStack()}
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>
  );
}
