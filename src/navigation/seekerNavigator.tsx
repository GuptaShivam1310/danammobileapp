import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import { SeekerLandingParamList } from '../models/navigation';
import { SeekerLanding } from '../screens/SeekerLanding/SeekerLanding';
import { LookingForItem } from '../screens/LookingForItem/LookingForItem';
import { LookingForGender } from '../screens/LookingForGender/LookingForGender';
import { LookingForDateForBirth } from '../screens/LookingForDateForBirth/LookingForDateForBirth';
import { LookingForProfession } from '../screens/LookingForProfession/LookingForProfession';
import { LookingForReason } from '../screens/LookingForReason/LookingForReason';
import { LookingForDoYou } from '../screens/LookingForDoYou/LookingForDoYou';
import { BottomSeekerTabsNavigator } from './BottomSeekerTabsNavigator';
import { PostDetailScreen } from '../screens/PostDetail/PostDetailScreen';
import { ProductDetailScreen } from '../screens/ProductDetail/ProductDetailScreen';
import { SelectLocationScreen } from '../screens/SelectLocation/SelectLocationScreen';
import { NotificationScreen } from '../screens/Notifications/NotificationScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { ChatImagePreviewScreen } from '../screens/ChatImagePreview/ChatImagePreviewScreen';
import { ChatDocumentPreviewScreen } from '../screens/ChatDocumentPreview/ChatDocumentPreviewScreen';
import { ImagePreviewScreen } from '../screens/Chat/ImagePreviewScreen';
import { PdfPreviewScreen } from '../screens/Chat/PdfPreviewScreen';

const Stack = createNativeStackNavigator<SeekerLandingParamList>();

interface SeekerLandingNavigatorProps {
  hasLookingForFlowData?: boolean;
}

export function SeekerLandingNavigator({
  hasLookingForFlowData = false,
}: SeekerLandingNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={
        hasLookingForFlowData ? ROUTES.SEEKER_BOTTOM_TABS : ROUTES.SEEKER_LANDING
      }
    >
      <Stack.Screen
        name={ROUTES.SEEKER_LANDING}
        component={SeekerLanding}
      />
      <Stack.Screen
        name={ROUTES.SEEKER_BOTTOM_TABS}
        component={BottomSeekerTabsNavigator}
      />
      <Stack.Screen
        name={ROUTES.LOOKING_FOR_ITEM}
        component={LookingForItem}
      />
      <Stack.Screen
        name={ROUTES.LOOKING_FOR_GENDER}
        component={LookingForGender}
      />
      <Stack.Screen
        name={ROUTES.LOOKING_FOR_DOB}
        component={LookingForDateForBirth}
      />
      <Stack.Screen
        name={ROUTES.LOOKING_FOR_PROFESSION}
        component={LookingForProfession}
      />
      <Stack.Screen
        name={ROUTES.SELECT_LOCATION}
        component={SelectLocationScreen}
      />
      <Stack.Screen
        name={ROUTES.LOOKING_FOR_REASON}
        component={LookingForReason}
      />
      <Stack.Screen
        name={ROUTES.LOOKING_FOR_DO_YOU}
        component={LookingForDoYou}
      />
      <Stack.Screen
        name={ROUTES.POST_DETAIL}
        component={PostDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.PRODUCT_DETAIL}
        component={ProductDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.CHAT}
        component={ChatScreen}
      />
      <Stack.Screen
        name={ROUTES.CHAT_IMAGE_PREVIEW}
        component={ChatImagePreviewScreen}
      />
      <Stack.Screen
        name={ROUTES.CHAT_DOCUMENT_PREVIEW}
        component={ChatDocumentPreviewScreen}
      />
      <Stack.Screen
        name={ROUTES.CHAT_IMAGE_VIEW}
        component={ImagePreviewScreen}
      />
      <Stack.Screen
        name={ROUTES.CHAT_PDF_VIEW}
        component={PdfPreviewScreen}
      />
      <Stack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationScreen}
      />
    </Stack.Navigator>
  );
}
