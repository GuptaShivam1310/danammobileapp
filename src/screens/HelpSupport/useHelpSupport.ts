import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../models/navigation';
import { ROUTES } from '../../constants/routes';

export const useHelpSupport = () => {
    const navigation = useNavigation<NativeStackNavigationProp<DrawerParamList>>();
    const [isRateModalVisible, setIsRateModalVisible] = useState(false);
    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleItemPress = useCallback((item: string) => {
        switch (item) {
            case 'FAQs':
                navigation.navigate(ROUTES.FAQS);
                break;
            case 'About Us':
                navigation.navigate(ROUTES.ABOUT_US);
                break;
            case 'Contact Us':
                navigation.navigate(ROUTES.CONTACT_US);
                break;
            case 'Terms and condition':
                navigation.navigate(ROUTES.TERMS_CONDITION);
                break;
            case 'Rate Us':
                setIsRateModalVisible(true);
                break;
            default:
                break;
        }
    }, [navigation]);

    const closeRateModal = useCallback(() => {
        setIsRateModalVisible(false);
    }, []);

    return {
        handleBack,
        handleItemPress,
        isRateModalVisible,
        closeRateModal,
    };
};
