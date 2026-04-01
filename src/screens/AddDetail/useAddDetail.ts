import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../models/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setPostDetails } from '../../store/slices/postSlice';
import { ROUTES } from '../../constants/routes';

type AddDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useAddDetail = () => {
    const navigation = useNavigation<AddDetailNavigationProp>();
    const dispatch = useDispatch();
    const { newPostData } = useSelector((state: RootState) => state.post);

    const [title, setTitle] = useState(newPostData.title || '');
    const [description, setDescription] = useState(newPostData.description || '');

    const TITLE_LIMIT = 70;
    const DESCRIPTION_LIMIT = 500;

    const handleTitleChange = (text: string) => {
        setTitle(text.slice(0, TITLE_LIMIT));
    };

    const handleDescriptionChange = (text: string) => {
        setDescription(text.slice(0, DESCRIPTION_LIMIT));
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNext = () => {
        dispatch(setPostDetails({ title, description }));
        navigation.navigate(ROUTES.UPLOAD_IMAGES);
    };

    return {
        title,
        description,
        handleTitleChange,
        handleDescriptionChange,
        handleBack,
        handleNext,
        TITLE_LIMIT,
        DESCRIPTION_LIMIT,
    };
};
