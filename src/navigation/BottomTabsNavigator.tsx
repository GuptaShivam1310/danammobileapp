import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform } from 'react-native';
import { ROUTES } from '../constants/routes';
import { BottomTabParamList } from '../models/navigation';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PostScreen } from '../screens/Post/PostScreen';
import { ProfileNavigator } from './ProfileNavigator';
import { MoreScreen } from '../screens/More/MoreScreen';
import { TabBarIcon } from '../components/common/TabBarIcon';
import * as Icons from '../assets/icons';
import { moderateScale, verticalScale } from '../theme/scale';
import { palette } from '../constants/colors';
import { ChatListScreen } from '../screens/ChatList/ChatListScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabsNavigator = () => {

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: [
                    styles.tabBar,
                    {

                    },
                ],
            }}
        >
            <Tab.Screen
                name={ROUTES.DASHBOARD}
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }: { focused: boolean }) => (
                        <TabBarIcon
                            icon={focused ? Icons.ActiveDashboardIcon : Icons.DashboardIcon}
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
                            icon={focused ? Icons.ActiveChatIcon : Icons.ChatIcon}
                            isFocused={focused}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ROUTES.MORE}
                component={MoreScreen}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                    },
                }}
                options={{
                    tabBarIcon: ({ focused }: { focused: boolean }) => (
                        <TabBarIcon
                            icon={Icons.ActiveMoreIcon}
                            isFocused={focused}
                            isMiddle
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ROUTES.POST}
                component={PostScreen}
                options={{
                    tabBarIcon: ({ focused }: { focused: boolean }) => (
                        <TabBarIcon
                            icon={focused ? Icons.ActivePostIcon : Icons.PostIcon}
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
                            icon={focused ? Icons.ActiveProfileIcon : Icons.ProfileIcon}
                            isFocused={focused}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: verticalScale(70),
        borderTopWidth: 0,
        backgroundColor: palette.transparent,
        elevation: 0,
        position: 'absolute',
        // bottom: moderateScale(20),
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
