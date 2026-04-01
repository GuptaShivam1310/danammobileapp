// Mock dependencies at the top before any imports that might use them
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    },
}));

jest.mock('react-native-vector-icons/Feather', () => 'Icon');

jest.mock('react-native', () => {
    const ReactLib = require('react');
    const createPrimitive = (name: string) =>
        ({ children, ...props }: any) => ReactLib.createElement(name, props, children);

    return {
        View: createPrimitive('View'),
        Text: createPrimitive('Text'),
        TouchableOpacity: createPrimitive('TouchableOpacity'),
        ScrollView: createPrimitive('ScrollView'),
        ActivityIndicator: createPrimitive('ActivityIndicator'),
        Image: createPrimitive('Image'),
        Modal: createPrimitive('Modal'),
        TextInput: createPrimitive('TextInput'),
        TouchableWithoutFeedback: createPrimitive('TouchableWithoutFeedback'),
        StyleSheet: {
            create: (styles: any) => styles,
            flatten: (styles: any) => styles,
        },
        Platform: {
            OS: 'ios',
            select: (obj: any) => obj.ios,
        },
        Alert: {
            alert: jest.fn(),
        },
        Keyboard: {
            dismiss: jest.fn(),
        },
    };
});

import React from 'react';
import { render, fireEvent, renderHook, act, waitFor } from '@testing-library/react-native';
import { RequestDetailScreen } from '../../src/screens/RequestDetail/RequestDetailScreen';
import { useRequestDetail } from '../../src/screens/RequestDetail/useRequestDetail';
import { requestApi } from '../../src/services/api/requestApi';

// Mock the hook specifically
const { useRequestDetail: realHook } = jest.requireActual('../../src/screens/RequestDetail/useRequestDetail');
jest.mock('../../src/screens/RequestDetail/useRequestDetail', () => ({ useRequestDetail: jest.fn() }));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

jest.mock('../../src/store', () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock('../../src/services/api/requestApi', () => ({
    requestApi: { getRequestDetail: jest.fn() }
}));

jest.mock('../../src/theme', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                background: '#F5F5F5',
                surface: '#FFFFFF',
                text: '#000000',
                mutedText: '#666666',
                border: '#EEEEEE',
                brandGreen: '#0B6B4F',
            },
        },
    }),
}));

jest.mock('../../src/theme/scale', () => ({
    moderateScale: (val: number) => val,
    verticalScale: (val: number) => val,
    normalize: (val: number) => val,
    scale: (val: number) => val,
}));

jest.mock('../../src/theme/fonts', () => ({
    fonts: {
        bold: 'System',
        regular: 'System',
        medium: 'System',
    }
}));

jest.mock('../../src/components/common/SuccessModal', () => ({
    SuccessModal: ({ isVisible, title, subtitle, buttonText, onButtonPress, testIDPrefix }: any) => {
        const React = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        if (!isVisible) return null;
        return (
            <View testID={`${testIDPrefix}-modal`}>
                <Text>{title}</Text>
                <Text>{subtitle}</Text>
                <TouchableOpacity onPress={onButtonPress} testID={`${testIDPrefix}-button`}>
                    <Text>{buttonText}</Text>
                </TouchableOpacity>
            </View>
        );
    },
}));

jest.mock('../../src/components/common/ReportUserModal', () => ({
    ReportUserModal: ({ isVisible, onCancel, onReport }: any) => {
        const React = require('react');
        const { View, Text, TouchableOpacity } = require('react-native');
        if (!isVisible) return null;
        return (
            <View testID="report-modal">
                <TouchableOpacity onPress={onCancel} testID="report-cancel-button">
                    <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onReport} testID="report-submit-button">
                    <Text>Report</Text>
                </TouchableOpacity>
            </View>
        );
    },
}));

jest.mock('../../src/assets/icons', () => ({
    SuccessCheckIcon: 'SuccessCheckIcon',
}));

jest.mock('../../src/components/common/ScreenWrapper', () => ({
    ScreenWrapper: ({ children, testID }: any) => {
        const React = require('react');
        const { View } = require('react-native');
        return React.createElement(View, { testID }, children);
    },
}));

jest.mock('../../src/components/common/ReportUserModal', () => ({
    ReportUserModal: (p: any) => {
        const React = require('react');
        const { View, TouchableOpacity } = require('react-native');
        if (!p.isVisible) return null;
        return (
            <View testID="report-modal">
                <TouchableOpacity onPress={p.onReport} testID="request-detail-report-button" />
            </View>
        );
    },
}));

const mockData = {
    request_id: '1',
    user: {
        id: 'user-1',
        name: 'Donald Taylor',
        profile_image: 'test-avatar-url',
    },
    product_name: 'Apple MacBook air M2 256 GB 2024',
    gender: 'Male',
    date_of_birth: '19 July 1998',
    profession: 'Cashier',
    location: 'PRL Colony, Thaltej, Ahmedabad',
    reason: 'I need it for my college assignments presentation.',
    requested_date: '2024-05-12T20:00:00Z',
};

describe('RequestDetailScreen', () => {
    const mockUseRequestDetail = {
        data: mockData,
        isLoading: false,
        error: null,
        isActionLoading: false,
        isMenuVisible: false,
        isRejectModalVisible: false,
        isReportModalVisible: false,
        isSuccessModalVisible: false,
        rejectReason: '',
        reportReason: '',
        setRejectReason: jest.fn(),
        setReportReason: jest.fn(),
        setIsReportModalVisible: jest.fn(),
        handleAccept: jest.fn(),
        handleReject: jest.fn(),
        handleCloseRejectModal: jest.fn(),
        handleConfirmReject: jest.fn(),
        handleReport: jest.fn(),
        handleConfirmReport: jest.fn(),
        handleBackToChat: jest.fn(),
        toggleMenu: jest.fn(),
        handleRetry: jest.fn(),
        handleBack: jest.fn(),
    };

    beforeEach(() => {
        (useRequestDetail as jest.Mock).mockReturnValue(mockUseRequestDetail);
        jest.clearAllMocks();
    });

    it('renders correctly with data', () => {
        const { getByTestId, getByText } = render(<RequestDetailScreen />);

        expect(getByTestId('request-detail-screen')).toBeTruthy();
        expect(getByText('Donald Taylor')).toBeTruthy();
        expect(getByText('Apple MacBook air M2 256 GB 2024')).toBeTruthy();
        expect(getByText('Cashier')).toBeTruthy();
    });

    it('shows loading indicator when isLoading is true', () => {
        (useRequestDetail as jest.Mock).mockReturnValue({
            ...mockUseRequestDetail,
            isLoading: true,
            data: null,
        });

        const { getByTestId } = render(<RequestDetailScreen />);
        expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('shows success modal when isSuccessModalVisible is true', () => {
        const handleBackToChat = jest.fn();
        (useRequestDetail as jest.Mock).mockReturnValue({
            ...mockUseRequestDetail,
            isSuccessModalVisible: true,
            handleBackToChat,
        });

        const { getByTestId, getByText } = render(<RequestDetailScreen />);

        expect(getByTestId('accept-success-modal')).toBeTruthy();
        expect(getByText('requestDetail.acceptSuccessModal.title')).toBeTruthy();
        expect(getByText('requestDetail.acceptSuccessModal.subtitle')).toBeTruthy();

        fireEvent.press(getByTestId('accept-success-button'));
        expect(handleBackToChat).toHaveBeenCalled();
    });

    it('calls handleBack when back button is pressed', () => {
        const { getByTestId } = render(<RequestDetailScreen />);
        fireEvent.press(getByTestId('request-detail-back-button'));
        expect(mockUseRequestDetail.handleBack).toHaveBeenCalled();
    });

    it('calls handleAccept when accept button is pressed', () => {
        const { getByTestId } = render(<RequestDetailScreen />);
        fireEvent.press(getByTestId('request-detail-accept-button'));
        expect(mockUseRequestDetail.handleAccept).toHaveBeenCalled();
    });

    it('opens reject modal when reject button is pressed', () => {
        const { getByTestId } = render(<RequestDetailScreen />);
        fireEvent.press(getByTestId('request-detail-reject-button'));
        expect(mockUseRequestDetail.handleReject).toHaveBeenCalled();
    });

    it('shows reject modal and handles interaction', () => {
        const handleConfirmReject = jest.fn();
        const handleCloseRejectModal = jest.fn();
        const setRejectReason = jest.fn();

        (useRequestDetail as jest.Mock).mockReturnValue({
            ...mockUseRequestDetail,
            isRejectModalVisible: true,
            rejectReason: 'Not eligible',
            setRejectReason,
            handleConfirmReject,
            handleCloseRejectModal,
        });

        const { getByTestId, getByText } = render(<RequestDetailScreen />);

        expect(getByText('requestDetail.rejectModal.title')).toBeTruthy();
        const input = getByTestId('reject-reason-input');
        expect(input.props.value).toBe('Not eligible');

        fireEvent.changeText(input, 'New reason');
        expect(setRejectReason).toHaveBeenCalledWith('New reason');

        fireEvent.press(getByTestId('reject-modal-confirm-button'));
        expect(handleConfirmReject).toHaveBeenCalled();

        fireEvent.press(getByTestId('reject-modal-cancel-button'));
        expect(handleCloseRejectModal).toHaveBeenCalled();
    });

    it('calls toggleMenu when menu button is pressed', () => {
        const { getByTestId } = render(<RequestDetailScreen />);
        fireEvent.press(getByTestId('request-detail-menu-button'));
        expect(mockUseRequestDetail.toggleMenu).toHaveBeenCalled();
    });

    it('shows report button and calls handleReport when menu is visible', async () => {
        (useRequestDetail as jest.Mock).mockReturnValue({
            ...mockUseRequestDetail,
            isMenuVisible: true,
        });

        const { getByTestId } = render(<RequestDetailScreen />);
        const reportButton = getByTestId('request-detail-report-button');
        expect(reportButton).toBeTruthy();

        fireEvent.press(reportButton);
        expect(mockUseRequestDetail.handleReport).toHaveBeenCalled();
    });

    // ─── useRequestDetail Hook ───────────────────────────────────
    describe('useRequestDetail hook', () => {
        const { useRequestDetail: realHook } = jest.requireActual('../../src/screens/RequestDetail/useRequestDetail');

        const mockDispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
        const mockNavigate = jest.fn();
        const mockReplace = jest.fn();
        const mockGoBack = jest.fn();

        let storeState: any;

        beforeEach(() => {
            const { useNavigation, useRoute } = require('@react-navigation/native');
            const { useAppDispatch, useAppSelector } = require('../../src/store');

            mockNavigate.mockClear();
            mockReplace.mockClear();
            mockGoBack.mockClear();
            mockDispatch.mockClear();

            (useNavigation as jest.Mock).mockReturnValue({
                goBack: mockGoBack,
                navigate: mockNavigate,
                replace: mockReplace
            });
            (useRoute as jest.Mock).mockReturnValue({ params: { requestId: 'r1' } });
            (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

            storeState = {
                productSeekers: {
                    currentRequest: mockData,
                    loading: false,
                    error: null
                }
            };

            (useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(storeState));

            require('../../src/services/api/requestApi').requestApi.getRequestDetail.mockResolvedValue({
                success: true,
                data: mockData
            });
        });

        it('initializes and fetches data', async () => {
            const { result } = renderHook(() => realHook());

            await waitFor(() => {
                expect(result.current.data?.request_id).toBe('1');
            });
            expect(result.current.isLoading).toBe(false);
        });

        it('handles accept logic and failure', async () => {
            const { result } = renderHook(() => realHook());
            await waitFor(() => expect(result.current.data).toBeTruthy());

            // Success
            await act(async () => { await result.current.handleAccept(); });
            expect(mockDispatch).toHaveBeenCalled();

            // Failure
            mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Fail')) });
            await act(async () => { await result.current.handleAccept(); });
        });

        it('handles reject logic and failure', async () => {
            const { result } = renderHook(() => realHook());
            await waitFor(() => expect(result.current.data).toBeTruthy());

            act(() => { result.current.handleReject(); });
            expect(result.current.isRejectModalVisible).toBe(true);

            act(() => { result.current.setRejectReason('Too late'); });
            await act(async () => { await result.current.handleConfirmReject(); });

            // Failure
            mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Fail')) });
            await act(async () => { await result.current.handleConfirmReject(); });

            act(() => { result.current.handleCloseRejectModal(); });
            expect(result.current.isRejectModalVisible).toBe(false);
        });

        it('handles report submit and failure', async () => {
            const { result } = renderHook(() => realHook());
            await waitFor(() => expect(result.current.data).toBeTruthy());

            act(() => { result.current.handleReport(); });
            act(() => { result.current.setReportReason('Spam'); });

            await act(async () => { await result.current.handleConfirmReport(); });

            // Failure
            mockDispatch.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('Fail')) });
            await act(async () => { await result.current.handleConfirmReport(); });

            act(() => { result.current.setIsReportModalVisible(false); });
        });

        it('handles back actions', async () => {
            const { result } = renderHook(() => realHook());
            act(() => { result.current.handleBack(); });
            expect(mockGoBack).toHaveBeenCalled();

            act(() => { result.current.handleBackToChat(); });
            expect(mockReplace).toHaveBeenCalled();
        });

        it('handles api error and retry', async () => {
            storeState.productSeekers.error = 'Error';
            const { result } = renderHook(() => realHook());
            await waitFor(() => expect(result.current.error).toBeTruthy());

            storeState.productSeekers.error = null;
            storeState.productSeekers.currentRequest = mockData;
            await act(async () => { await result.current.handleRetry(); });
            expect(result.current.data).toBeTruthy();
        });
    });
});

describe('useRequestDetail hook branches', () => {
    const mockDispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
    const mockNavigate = jest.fn();
    const mockReplace = jest.fn();
    const mockGoBack = jest.fn();
    let storeState: any;

    beforeEach(() => {
        jest.clearAllMocks();
        const { useNavigation, useRoute } = require('@react-navigation/native');
        const { useAppDispatch, useAppSelector } = require('../../src/store');

        (useNavigation as jest.Mock).mockReturnValue({
            goBack: mockGoBack,
            navigate: mockNavigate,
            replace: mockReplace,
        });
        (useRoute as jest.Mock).mockReturnValue({ params: { requestId: 'req_1', seekerId: 's1', productId: 'p1' } });
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

        storeState = {
            productSeekers: { currentRequest: mockData, loading: false, error: null },
        };
        (useAppSelector as jest.Mock).mockImplementation((selector: any) => selector(storeState));

        requestApi.getRequestDetail.mockResolvedValue({ success: true, data: mockData });
    });

    it('covers all methods in useRequestDetail', async () => {
        const { result } = renderHook(() => realHook());

        await act(async () => {
            await result.current.handleAccept();
        });

        act(() => {
            result.current.handleReject();
        });
        expect(result.current.isRejectModalVisible).toBe(true);

        act(() => {
            result.current.setRejectReason('no');
            result.current.handleCloseRejectModal();
        });
        expect(result.current.isRejectModalVisible).toBe(false);

        await act(async () => {
            await result.current.handleConfirmReject();
        });

        act(() => {
            result.current.setReportReason('spam');
            result.current.handleReport();
        });
        expect(result.current.isReportModalVisible).toBe(true);

        await act(async () => {
            await result.current.handleConfirmReport();
            await result.current.handleBack();
            result.current.toggleMenu();
            result.current.handleBackToChat();
        });
    });

    it('handles edge cases and failures', async () => {
        const { useRoute } = require('@react-navigation/native');
        useRoute.mockReturnValueOnce({ params: {} }); // empty route
        const { result: emptyResult } = renderHook(() => realHook());
        await act(async () => {
             await emptyResult.current.handleAccept();
             await emptyResult.current.handleConfirmReject();
        });

        // Test API failure
        requestApi.getRequestDetail = jest.fn().mockResolvedValueOnce({ success: false });
        const { result: failResult } = renderHook(() => realHook());
        await act(async () => {}); 

        requestApi.getRequestDetail = jest.fn().mockRejectedValueOnce(new Error('error'));
        const { result: catchResult } = renderHook(() => realHook());
        await act(async () => {}); 

        // Test thunk unresolved
        const { useAppDispatch } = require('../../src/store');
        const mockDispatch = useAppDispatch();
        mockDispatch.mockResolvedValue({ match: () => false, payload: 'err' });
        
        await act(async () => {
            await failResult.current.handleAccept();
            await failResult.current.handleConfirmReject();
            failResult.current.setReportReason('spam');
            await failResult.current.handleConfirmReport();
            
            // Empty report missing reason
            failResult.current.setReportReason(' ');
            await failResult.current.handleConfirmReport();
        });

        mockDispatch.mockReturnValue({ match: () => false, payload: 'err2' });
        await act(async () => {
            await failResult.current.handleAccept();
            await failResult.current.handleConfirmReject();
            failResult.current.setReportReason('spam');
            await failResult.current.handleConfirmReport();
        });
    });
});

