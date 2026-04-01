import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { supportApi, FAQ } from '../../services/api/supportApi';
import get from 'lodash/get';

export const useFAQs = () => {
    const navigation = useNavigation();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await supportApi.getFaqs();
            setFaqs(data?.data || []);
        } catch (err) {
            setError(get(err, 'message', 'Failed to fetch FAQs'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const toggleExpand = useCallback((index: number) => {
        setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
    }, []);

    return {
        handleBack,
        faqs,
        loading,
        error,
        expandedIndex,
        toggleExpand,
        fetchFaqs,
    };
};
