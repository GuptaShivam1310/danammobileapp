import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import _ from 'lodash';
import { RootStackParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';
import { postApi } from '../../services/api/postApi';
import { setSubCategory } from '../../store/slices/postSlice';
import { RootState } from '../../store';

type SelectSubCategoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SelectSubCategoryRouteProp = RouteProp<RootStackParamList, typeof ROUTES.SELECT_SUBCATEGORY>;

export interface SubCategory {
    id: string;
    name: string;
}

export const useSelectSubCategory = () => {
    const navigation = useNavigation<SelectSubCategoryNavigationProp>();
    const route = useRoute<SelectSubCategoryRouteProp>();
    const dispatch = useDispatch();
    const newPostData = useSelector((state: RootState) => state.post.newPostData);

    const { categoryId, categoryName, isEdit, selectedSubCategoryId: editSubCategoryId } = route.params;
    // Determine subcategory ID pre-selection:
    // 1. Redux (if set and matches current category, e.g. user selected it then went back/forth)
    // 2. Navigation Params (initial edit flow entry, passed if category matches original)
    const reduxSubCategoryId = _.get(newPostData, 'subCategoryId');
    const matchesReduxCategory = String(_.get(newPostData, 'categoryId')) === String(categoryId) ||
        _.get(newPostData, 'categoryName') === categoryName;

    const initialSubCategoryId = (reduxSubCategoryId != null && matchesReduxCategory ? String(reduxSubCategoryId) : undefined) ||
        (isEdit ? (editSubCategoryId != null ? String(editSubCategoryId) : undefined) : undefined);

    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

    const fetchSubCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const responseData = await postApi.getSubCategories(categoryId);
            let subCategoriesData: SubCategory[] = [];

            if (responseData && responseData.data) {
                subCategoriesData = responseData.data;
            } else if (Array.isArray(responseData)) {
                subCategoriesData = responseData;
            }

            setSubCategories(subCategoriesData);

            // Pre-select subcategory using the derived ID or Name fallback
            if (initialSubCategoryId != null || newPostData?.subCategoryName) {
                const initial = subCategoriesData.find(
                    s => String(s.id) === String(initialSubCategoryId) ||
                        String(s.name) === String(newPostData?.subCategoryName)
                );
                if (initial) {
                    setSelectedSubCategory(initial);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch subcategories');
        } finally {
            setIsLoading(false);
        }
    }, [categoryId, initialSubCategoryId, newPostData?.subCategoryName]);

    useEffect(() => {
        fetchSubCategories();
    }, [fetchSubCategories]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSubCategoryPress = useCallback((subCategory: SubCategory) => {
        setSelectedSubCategory(subCategory);
        dispatch(setSubCategory({ id: subCategory.id, name: subCategory.name }));
        navigation.navigate(ROUTES.ADD_POST_DETAIL as any);
    }, [navigation, dispatch]);

    return {
        subCategories,
        isLoading,
        error,
        categoryName,
        handleBack,
        handleSubCategoryPress,
        fetchSubCategories,
        selectedSubCategory,
    };
};
