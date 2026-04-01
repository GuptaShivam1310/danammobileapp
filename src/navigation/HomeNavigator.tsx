import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { DrawerParamList } from '../models/navigation';
import { BottomTabsNavigator } from './BottomTabsNavigator';
import { EditProfileScreen } from '../screens/EditProfile/EditProfileScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { ChangePasswordScreen } from '../screens/ChangePassword/ChangePasswordScreen';
import { HelpSupportScreen } from '../screens/HelpSupport/HelpSupportScreen';

import { PostDetailScreen } from '../screens/PostDetail/PostDetailScreen';
import { SelectSeekerScreen } from '../screens/SelectSeeker/SelectSeekerScreen';
import { SelectCategoryScreen } from '../screens/SelectCategory/SelectCategoryScreen';
import { SelectSubCategoryScreen } from '../screens/SelectSubCategory/SelectSubCategoryScreen';
import { AddDetailScreen } from '../screens/AddDetail/AddDetailScreen';
import { UploadImagesScreen } from '../screens/UploadImages/UploadImagesScreen';
import { SelectLocationScreen } from '../screens/SelectLocation/SelectLocationScreen';
import { ProductSeekersScreen } from '../screens/ProductSeekers/ProductSeekersScreen';
import { RequestDetailScreen } from '../screens/RequestDetail/RequestDetailScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { NotificationScreen } from '../screens/Notifications/NotificationScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { ItemDetailScreen } from '../screens/ItemDetail/ItemDetailScreen';
import { ProductDetailScreen } from '../screens/ProductDetail/ProductDetailScreen';

import { ChatImagePreviewScreen } from '../screens/ChatImagePreview/ChatImagePreviewScreen';
import { ChatDocumentPreviewScreen } from '../screens/ChatDocumentPreview/ChatDocumentPreviewScreen';
import { ImagePreviewScreen } from '../screens/Chat/ImagePreviewScreen';
import { PdfPreviewScreen } from '../screens/Chat/PdfPreviewScreen';

const Stack = createNativeStackNavigator<DrawerParamList>();

export function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.APP_DRAWER} component={BottomTabsNavigator} />
      <Stack.Screen name={ROUTES.POST_DETAIL} component={PostDetailScreen} />
      <Stack.Screen name={ROUTES.ITEM_DETAIL} component={ItemDetailScreen} />
      <Stack.Screen name={ROUTES.PRODUCT_DETAIL} component={ProductDetailScreen} />
      <Stack.Screen name={ROUTES.SELECT_SEEKER} component={SelectSeekerScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.CHANGE_PASSWORD} component={ChangePasswordScreen} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={ROUTES.HELP_SUPPORT} component={HelpSupportScreen} />
      <Stack.Screen name={ROUTES.SELECT_CATEGORY} component={SelectCategoryScreen} />
      <Stack.Screen name={ROUTES.SELECT_SUBCATEGORY} component={SelectSubCategoryScreen} />
      <Stack.Screen name={ROUTES.ADD_POST_DETAIL} component={AddDetailScreen} />
      <Stack.Screen name={ROUTES.UPLOAD_IMAGES} component={UploadImagesScreen} />
      <Stack.Screen name={ROUTES.SELECT_LOCATION} component={SelectLocationScreen} />
      <Stack.Screen name={ROUTES.NOTIFICATIONS} component={NotificationScreen} />
      <Stack.Screen name={ROUTES.SEARCH} component={SearchScreen} />
      {/* ── Chat Module ──────────────────────────────────────────────────── */}
      <Stack.Screen name={ROUTES.CHAT_DETAIL} component={ProductSeekersScreen} />
      <Stack.Screen name={ROUTES.REQUEST_DETAIL} component={RequestDetailScreen} />
      <Stack.Screen name={ROUTES.CHAT} component={ChatScreen} />
      <Stack.Screen name={ROUTES.CHAT_IMAGE_PREVIEW} component={ChatImagePreviewScreen} />
      <Stack.Screen name={ROUTES.CHAT_DOCUMENT_PREVIEW} component={ChatDocumentPreviewScreen} />
      <Stack.Screen name={ROUTES.CHAT_IMAGE_VIEW} component={ImagePreviewScreen} />
      <Stack.Screen name={ROUTES.CHAT_PDF_VIEW} component={PdfPreviewScreen} />

    </Stack.Navigator>
  );
}
