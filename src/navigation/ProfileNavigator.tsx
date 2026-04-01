import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { ProfileParamList } from '../models/navigation';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { ChangePasswordScreen } from '../screens/ChangePassword/ChangePasswordScreen';
import { EditProfileScreen } from '../screens/EditProfile/EditProfileScreen';
import { HelpSupportScreen } from '../screens/HelpSupport/HelpSupportScreen';
import { FAQsScreen } from '../screens/FAQs/FAQsScreen';
import { AboutUsScreen } from '../screens/AboutUs/AboutUsScreen';
import { ContactUsScreen } from '../screens/ContactUs/ContactUsScreen';
import { TermsConditionScreen } from '../screens/TermsCondition/TermsConditionScreen';
import { RateUsScreen } from '../screens/RateUs/RateUsScreen';
import { MyReceivedGoodsScreen } from '../screens/MyReceivedGoods/MyReceivedGoodsScreen';

const Stack = createNativeStackNavigator<ProfileParamList>();

export function ProfileNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
            <Stack.Screen name={ROUTES.MY_RECEIVED_GOODS} component={MyReceivedGoodsScreen} />
            <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
            <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
            <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
            <Stack.Screen name={ROUTES.HELP_SUPPORT} component={HelpSupportScreen} />
            <Stack.Screen name={ROUTES.FAQS} component={FAQsScreen} />
            <Stack.Screen name={ROUTES.ABOUT_US} component={AboutUsScreen} />
            <Stack.Screen name={ROUTES.CONTACT_US} component={ContactUsScreen} />
            <Stack.Screen name={ROUTES.TERMS_CONDITION} component={TermsConditionScreen} />
            <Stack.Screen name={ROUTES.RATE_US} component={RateUsScreen} />
        </Stack.Navigator>
    );
}
