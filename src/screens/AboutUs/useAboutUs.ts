import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { supportApi, AboutData } from '../../services/api/supportApi';
import get from 'lodash/get';

export const useAboutUs = () => {
    const navigation = useNavigation();
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAbout = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await supportApi.getAbout();
            setAboutData(data);
        } catch (err) {
            setError(get(err, 'message', 'Failed to fetch About Us details'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAbout();
    }, [fetchAbout]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return {
        handleBack,
        aboutData,
        loading,
        error,
        fetchAbout,
    };
};
