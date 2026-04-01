import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { AuthStackParamList } from '../models/navigation';
import { LoginScreen } from '../screens/Login/LoginScreen';
import { SignUpScreen } from '../screens/SignUp/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPassword/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPassword/ResetPasswordScreen';
import { ResetPasswordSuccessScreen } from '../screens/ResetPasswordSuccess/ResetPasswordSuccessScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      <Stack.Screen name={ROUTES.SIGN_UP} component={SignUpScreen} />
      <Stack.Screen name={ROUTES.RESET_PASSWORD} component={ResetPasswordScreen} />
      <Stack.Screen
        name={ROUTES.RESET_PASSWORD_SUCCESS}
        component={ResetPasswordSuccessScreen}
      />
    </Stack.Navigator>
  );
}
