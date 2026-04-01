import type { ReactNode } from 'react';
import type {
  ImageResizeMode,
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { Category } from '../../../services/api/postApi';

export interface HomeHeaderProps {
  showNotificationDot?: boolean;
  onNotificationPress?: () => void;
  title?: string;
  notificationIcon?: any;
  testID?: string;
}

export interface SearchFilterBarProps {
  onSearch?: (searchText: string) => void;
  onFilterPress?: () => void;
  onPress?: () => void;
  searchPlaceholder?: string;
  searchIcon?: any;
  filterIcon?: any;
  debounceDelay?: number;
  value?: string;
  testID?: string;
}

export interface ContributeBannerProps {
  onPress?: () => void;
  testID?: string;
  buttonText?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  date?: string;
  created_at?: string;
  image?: string | null;
  image_url?: string | null;
}

export interface ProductCardProps {
  item: ProductItem;
  onPress?: () => void;
  testID?: string;
  isContributed?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  imageWrapperStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  dateStyle?: StyleProp<TextStyle>;
  badgeContainerStyle?: StyleProp<ViewStyle>;
  imageResizeMode?: ImageResizeMode;
  renderImageOverlay?: ReactNode;
  onImageError?: () => void;
  useDefaultContainerStyle?: boolean;
}

export interface CategoryFilterBottomSheetProps {
  isVisible: boolean;
  categories: Category[];
  selectedCategoryId?: string | null;
  isLoading: boolean;
  error: string | null;
  onSelectCategory: (category: Category) => void;
  onClose: () => void;
}
