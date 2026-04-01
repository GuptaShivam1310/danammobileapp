import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { ROUTES } from '../constants/routes';
import { SeekerBottomTabParamList } from '../models/navigation';
import { TabBarIcon } from '../components/common/TabBarIcon';
import Images from '../assets/images';
import { ProfileNavigator } from './ProfileNavigator';
import { SeekerDashboardScreen } from '../screens/SeekerDashboard/SeekerDashboardScreen';
import { WishlistScreen } from '../screens/Wishlist/WishlistScreen';
import { moderateScale, verticalScale } from '../theme/scale';
import { palette } from '../constants/colors';
import { ChatListScreen } from '../screens/ChatList/ChatListScreen';

const Tab = createBottomTabNavigator<SeekerBottomTabParamList>();

export function BottomSeekerTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name={ROUTES.SEEKER_DASHBOARD}
        component={SeekerDashboardScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon
              icon={focused ? Images.icons.activeDashboard : Images.icons.dashboard}
              isFocused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.CHAT}
        component={ChatListScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon
              icon={focused ? Images.icons.activeChat : Images.icons.chat}
              isFocused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.WISHLIST}
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon
              icon={focused ? Images.icons.activeWishlist : Images.icons.wishlist}
              isFocused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon
              icon={focused ? Images.icons.activeProfile : Images.icons.profile}
              isFocused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: verticalScale(70),
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    position: 'absolute',
    bottom: moderateScale(20),
    left: moderateScale(20),
    right: moderateScale(20),
    borderRadius: moderateScale(35),
    shadowColor: palette.blackPure,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? verticalScale(15) : verticalScale(5),
    marginHorizontal: moderateScale(20),
  },
});
