import { ROUTES } from '../constants/routes';

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.RESET_PASSWORD]: { resetToken?: string; resetUrl?: string } | undefined;
  [ROUTES.RESET_PASSWORD_SUCCESS]: undefined;
  [ROUTES.SIGN_UP]: undefined;
};

export type DrawerParamList = {
  [ROUTES.APP_DRAWER]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.CHANGE_PASSWORD]: undefined;
  [ROUTES.HELP_SUPPORT]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.FAQS]: undefined;
  [ROUTES.ABOUT_US]: undefined;
  [ROUTES.CONTACT_US]: undefined;
  [ROUTES.TERMS_CONDITION]: undefined;
  [ROUTES.RATE_US]: undefined;
  [ROUTES.NOTIFICATIONS]: undefined;
  [ROUTES.SEARCH]: undefined;
  [ROUTES.POST_DETAIL]: { id: string; selectedSeeker?: any; isPreview?: boolean };
  [ROUTES.ITEM_DETAIL]: { id: string };
  [ROUTES.PRODUCT_DETAIL]: {
    id: string;
    status?: ProductDetailStatus;
    productData?: ProductDetailRouteData;
    fromMyReceivedGoods?: boolean;
  };
  [ROUTES.SELECT_SEEKER]: { contributionId: string };
  [ROUTES.SELECT_CATEGORY]: { isEdit?: boolean; selectedCategoryId?: string; selectedSubCategoryId?: string } | undefined;
  [ROUTES.SELECT_SUBCATEGORY]: { categoryId: string; categoryName: string; isEdit?: boolean; selectedSubCategoryId?: string };
  [ROUTES.ADD_POST_DETAIL]: undefined;
  [ROUTES.UPLOAD_IMAGES]: undefined;
  [ROUTES.SELECT_LOCATION]: SelectLocationParams | undefined;
  [ROUTES.CHAT_DETAIL]: { chatId: string; productTitle?: string; productImage?: string };
  [ROUTES.REQUEST_DETAIL]: { requestId: string };
  [ROUTES.CHAT_IMAGE_PREVIEW]: {
    imageUri: string;
    chatId: string;
    seekerName: string;
    fileName?: string;
    fileUri?: string;
    mimeType?: string;
  };
  [ROUTES.CHAT_DOCUMENT_PREVIEW]: {
    documentUri: string;
    documentName: string;
    documentType: string;
    documentSize: string;
    chatId: string;
    seekerName: string;
    fileName?: string;
    fileUri?: string;
    mimeType?: string;
    type?: 'image' | 'pdf' | 'document';
  };
  [ROUTES.CHAT_IMAGE_VIEW]: {
    imageUri: string;
    fileName?: string;
  };
  [ROUTES.CHAT_PDF_VIEW]: {
    pdfUri: string;
    fileName?: string;
  };
  [ROUTES.CHAT]: {
    seekerId: string;
    seekerName: string;
    seekerAvatar?: string;
    productId: string;
    productTitle?: string;
    productImage?: string;
    requestId?: string;
  };
};

export type ProfileParamList = {
  [ROUTES.PROFILE]: undefined;
  [ROUTES.MY_RECEIVED_GOODS]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.CHANGE_PASSWORD]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.HELP_SUPPORT]: undefined;
  [ROUTES.FAQS]: undefined;
  [ROUTES.ABOUT_US]: undefined;
  [ROUTES.CONTACT_US]: undefined;
  [ROUTES.TERMS_CONDITION]: undefined;
  [ROUTES.RATE_US]: undefined;
};

export type BottomTabParamList = {
  [ROUTES.DASHBOARD]: undefined;
  [ROUTES.CHAT]: {
    seekerId: string;
    seekerName: string;
    seekerAvatar?: string;
    productId: string;
    productTitle?: string;
    productImage?: string;
    requestId?: string;
  };
  [ROUTES.POST]: undefined;
  [ROUTES.PROFILE]: undefined;
  [ROUTES.MORE]: undefined;
};

export type SeekerBottomTabParamList = {
  [ROUTES.SEEKER_DASHBOARD]: { searchValue?: string } | undefined;
  [ROUTES.CHAT]: undefined;
  [ROUTES.WISHLIST]: undefined;
  [ROUTES.PROFILE]: undefined;
};
export type GenderOption = 'Male' | 'Female';
export type ProductDetailStatus = 'pending' | 'in-progress' | 'done';

export interface ProductDetailRouteData {
  id: string;
  title: string;
  date?: string;
  image?: string | null;
  images?: string[];
  description?: string;
  categoryName?: string;
  subCategoryName?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  contributorName?: string;
  contributorEmail?: string;
  contributorPhone?: string;
}

export interface SelectLocationParams {
  item?: string;
  gender?: GenderOption;
  dob?: string;
  profession?: string;
  userType?: string;
}

export interface LookingForFlowData {
  item: string;
  gender: GenderOption;
  dob: string;
  profession: string;
  reason?: string;
  awarenessSource?: string;
  selectedLocation?: {
    latitude: number;
    longitude: number;
    fullAddress: string;
    area?: string;
    city?: string;
    title?: string;
  };
}

export type RootStackParamList = {
  [ROUTES.SEEKER_BOTTOM_TABS]: undefined;
  [ROUTES.SEEKER_DASHBOARD]: { flowData?: LookingForFlowData } | undefined;
  [ROUTES.ONBOARDING]: undefined;
  [ROUTES.LOGIN]: undefined;
  [ROUTES.FORGOT_PASSWORD]: undefined;
  [ROUTES.RESET_PASSWORD]: { resetToken?: string; resetUrl?: string } | undefined;
  [ROUTES.RESET_PASSWORD_SUCCESS]: undefined;
  [ROUTES.SIGN_UP]: undefined;
  [ROUTES.AUTH_STACK]: undefined;
  [ROUTES.APP_DRAWER]: undefined;
  [ROUTES.SEKKER_STACK]: undefined;
  [ROUTES.NOTIFICATIONS]: undefined;
  [ROUTES.SEARCH]: undefined;
  [ROUTES.SELECT_CATEGORY]: { isEdit?: boolean; selectedCategoryId?: string; selectedSubCategoryId?: string } | undefined;
  [ROUTES.SELECT_SUBCATEGORY]: { categoryId: string; categoryName: string; isEdit?: boolean; selectedSubCategoryId?: string };
  [ROUTES.ADD_POST_DETAIL]: undefined;
  [ROUTES.UPLOAD_IMAGES]: undefined;
  [ROUTES.SELECT_LOCATION]: SelectLocationParams | undefined;
  [ROUTES.POST_DETAIL]: { id: string; selectedSeeker?: any; isPreview?: boolean };
  [ROUTES.ITEM_DETAIL]: { id: string };
  [ROUTES.PRODUCT_DETAIL]: {
    id: string;
    status?: ProductDetailStatus;
    productData?: ProductDetailRouteData;
    fromMyReceivedGoods?: boolean;
  };
  [ROUTES.SELECT_SEEKER]: { contributionId: string };
  [ROUTES.LOOKING_FOR_ITEM]: undefined;
  [ROUTES.LOOKING_FOR_GENDER]: { item: string };
  [ROUTES.LOOKING_FOR_DOB]: { item: string; gender: GenderOption };
  [ROUTES.LOOKING_FOR_PROFESSION]: { item: string; gender: GenderOption; dob: string };
  [ROUTES.LOOKING_FOR_REASON]: {
    item: string;
    gender: GenderOption;
    dob: string;
    profession: string;
    selectedLocation?: {
      latitude: number;
      longitude: number;
      fullAddress: string;
      area?: string;
      city?: string;
      title?: string;
    };
  };
  [ROUTES.LOOKING_FOR_DO_YOU]: {
    item: string;
    gender: GenderOption;
    dob: string;
    profession: string;
    reason: string;
    selectedLocation?: {
      latitude: number;
      longitude: number;
      fullAddress: string;
      area?: string;
      city?: string;
      title?: string;
    };
  };
  [ROUTES.REQUEST_DETAIL]: { requestId: string };
};

export type SeekerLandingParamList = {
  [ROUTES.SEKKER_STACK]: undefined;
  [ROUTES.SEEKER_BOTTOM_TABS]: undefined;
  [ROUTES.SEEKER_DASHBOARD]: undefined;
  [ROUTES.SEEKER_LANDING]: undefined;
  [ROUTES.CHAT]: {
    seekerId: string;
    seekerName: string;
    seekerAvatar?: string;
    productId: string;
    productTitle?: string;
    productImage?: string;
    requestId?: string;
  };
  [ROUTES.NOTIFICATIONS]: undefined;
  [ROUTES.WISHLIST]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.CHANGE_PASSWORD]: undefined;
  [ROUTES.HELP_SUPPORT]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.FAQS]: undefined;
  [ROUTES.ABOUT_US]: undefined;
  [ROUTES.CONTACT_US]: undefined;
  [ROUTES.TERMS_CONDITION]: undefined;
  [ROUTES.RATE_US]: undefined;
  [ROUTES.POST_DETAIL]: { id: string; selectedSeeker?: any; isPreview?: boolean };
  [ROUTES.ITEM_DETAIL]: { id: string };
  [ROUTES.PRODUCT_DETAIL]: {
    id: string;
    status?: ProductDetailStatus;
    productData?: ProductDetailRouteData;
    fromMyReceivedGoods?: boolean;
  };
  [ROUTES.SELECT_SEEKER]: { contributionId: string };
  [ROUTES.SELECT_CATEGORY]: { isEdit?: boolean; selectedCategoryId?: string; selectedSubCategoryId?: string } | undefined;
  [ROUTES.SELECT_SUBCATEGORY]: { categoryId: string; categoryName: string; isEdit?: boolean; selectedSubCategoryId?: string };
  [ROUTES.ADD_POST_DETAIL]: undefined;
  [ROUTES.UPLOAD_IMAGES]: undefined;
  [ROUTES.SELECT_LOCATION]: SelectLocationParams | undefined;
  [ROUTES.LOOKING_FOR_ITEM]: undefined;
  [ROUTES.LOOKING_FOR_GENDER]: { item: string };
  [ROUTES.LOOKING_FOR_DOB]: { item: string; gender: GenderOption };
  [ROUTES.LOOKING_FOR_PROFESSION]: { item: string; gender: GenderOption; dob: string };
  [ROUTES.LOOKING_FOR_REASON]: {
    item: string;
    gender: GenderOption;
    dob: string;
    profession: string;
    selectedLocation?: {
      latitude: number;
      longitude: number;
      fullAddress: string;
      area?: string;
      city?: string;
      title?: string;
    };
  };
  [ROUTES.LOOKING_FOR_DO_YOU]: {
    item: string;
    gender: GenderOption;
    dob: string;
    profession: string;
    reason: string;
    selectedLocation?: {
      latitude: number;
      longitude: number;
      fullAddress: string;
      area?: string;
      city?: string;
      title?: string;
    };
  };
  [ROUTES.CHAT_IMAGE_PREVIEW]: {
    imageUri: string;
    chatId: string;
    seekerName: string;
    fileName?: string;
    fileUri?: string;
    mimeType?: string;
  };
  [ROUTES.CHAT_DOCUMENT_PREVIEW]: {
    documentUri: string;
    documentName: string;
    documentType: string;
    documentSize: string;
    chatId: string;
    seekerName: string;
    fileName?: string;
    fileUri?: string;
    mimeType?: string;
    type?: 'image' | 'pdf' | 'document';
  };
  [ROUTES.CHAT_IMAGE_VIEW]: {
    imageUri: string;
    fileName?: string;
  };
  [ROUTES.CHAT_PDF_VIEW]: {
    pdfUri: string;
    fileName?: string;
  };
};
