import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { supportApi, TermsData } from '../../services/api/supportApi';
import get from 'lodash/get';

export const useTermsCondition = () => {
    const navigation = useNavigation();
    const [termsData, setTermsData] = useState<TermsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTerms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await supportApi.getTerms();
            setTermsData(data);
        } catch (err) {
            setError(get(err, 'message', 'Failed to fetch Terms & Conditions'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTerms();
    }, [fetchTerms]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return {
        handleBack,
        termsData,
        loading,
        error,
        fetchTerms,
    };
};
