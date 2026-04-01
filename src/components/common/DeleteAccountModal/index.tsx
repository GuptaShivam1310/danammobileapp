import React from 'react';
import { useTheme } from '../../../theme';
import DeleteIcon from '../../../assets/icons/delete.svg';
import { ActionModal } from '../ActionModal';
import { palette } from '../../../constants/colors';
import { useTranslation } from 'react-i18next';

interface DeleteAccountModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
}) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    return (
        <ActionModal
            isVisible={isVisible}
            onClose={onClose}
            onConfirm={onConfirm}
            icon={DeleteIcon}
            title={t('deleteAccountModal.title')}
            subtitle={[
                t('deleteAccountModal.subtitle1'),
            ]}
            cancelText={t('deleteAccountModal.cancel')}
            confirmText={t('deleteAccountModal.confirm')}
            confirmButtonColor={theme.colors.danger || palette.red700}
            testIDPrefix="delete-account-modal"
        />
    );
};
