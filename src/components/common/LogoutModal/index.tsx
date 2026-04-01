import React from 'react';
import { useTranslation } from 'react-i18next';
import SignOutIcon from '../../../assets/icons/signout.svg';
import { ActionModal } from '../ActionModal';

interface LogoutModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
}) => {
    const { t } = useTranslation();

    return (
        <ActionModal
            isVisible={isVisible}
            onClose={onClose}
            onConfirm={onConfirm}
            icon={SignOutIcon}
            title={t('logoutModal.title')}
            subtitle={t('logoutModal.subtitle')}
            cancelText={t('logoutModal.cancel')}
            confirmText={t('logoutModal.confirm')}
            testIDPrefix="logout-modal"
        />
    );
};
