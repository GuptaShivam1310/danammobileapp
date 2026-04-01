import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import _ from 'lodash';
import { RootStackParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { postApi } from '../../services/api/postApi';
import { setCategory } from '../../store/slices/postSlice';
import { RootState } from '../../store';

type SelectCategoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SelectCategoryRouteProp = RouteProp<RootStackParamList, typeof ROUTES.SELECT_CATEGORY>;

export interface Category {
    id: string;
    name: string;
    icon?: string;
    bgColor?: string;
    item_count?: number;
}

export const useSelectCategory = () => {
    const navigation = useNavigation<SelectCategoryNavigationProp>();
    const route = useRoute<SelectCategoryRouteProp>();
    const dispatch = useDispatch();
    const newPostData = useSelector((state: RootState) => state.post.newPostData);

    // Edit-flow params passed from PostDetailScreen
    const isEdit = route.params?.isEdit ?? false;
    const editCategoryId = route.params?.selectedCategoryId;
    const editSubCategoryId = route.params?.selectedSubCategoryId;
    // Use Redux as the primary source of truth (set by setEditPostData in edit flow),
    // and fallback to navigation params only if Redux is empty.
    const reduxCategoryId = _.get(newPostData, 'categoryId');
    const initialCategoryId = (reduxCategoryId != null ? String(reduxCategoryId) : undefined) ||
        (isEdit ? editCategoryId : undefined);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const responseData = await postApi.getCategories();
            let categoriesData: Category[] = [];

            if (responseData && (responseData as any).data) {
                categoriesData = (responseData as any).data;
            } else if (Array.isArray(responseData)) {
                categoriesData = responseData;
            }

            setCategories(categoriesData);

            // Pre-select category. Since useSelectCategory remounts on back navigation, 
            // this ensures we highlight the user's latest selection (stored in Redux).
            if (newPostData?.categoryName) {
                const initial = categoriesData.find(
                    c => String(c.name) === String(newPostData.categoryName)
                );
                if (initial) {
                    setSelectedCategory(initial);
                }
            } else if (initialCategoryId) {
                const initial = categoriesData.find(
                    c => String(c.id) === String(initialCategoryId)
                );
                if (initial) {
                    setSelectedCategory(initial);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    }, [initialCategoryId, newPostData?.categoryName]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleClose = () => {
        navigation.goBack();
    };

    const handleCategoryPress = useCallback((category: Category) => {
        setSelectedCategory(category);
        dispatch(setCategory({ id: category.id, name: category.name }));

        // Pass 'isEdit' forward and determine if we should suggest the original subcategory highlight.
        // If it's the same category as the original post, we allow subcategory pre-selection.
        const isOriginalEditCategory = isEdit && String(category.id) === String(editCategoryId);

        navigation.navigate(ROUTES.SELECT_SUBCATEGORY as any, {
            categoryId: category.id,
            categoryName: category.name,
            ...(isEdit && {
                isEdit: true,
                selectedSubCategoryId: isOriginalEditCategory ? editSubCategoryId : undefined,
            }),
        });
    }, [navigation, dispatch, isEdit, editCategoryId, editSubCategoryId]);

    return {
        categories,
        isLoading,
        error,
        handleClose,
        handleCategoryPress,
        fetchCategories,
        selectedCategory,
    };
};
