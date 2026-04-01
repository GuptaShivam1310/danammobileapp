import React from 'react';
import { AppInput } from '../../common/AppInput';

interface PasswordInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    isVisible: boolean;
    onToggleVisibility: () => void;
    error?: string;
    testID?: string;
    eyeTestID?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    isVisible,
    onToggleVisibility,
    error,
    testID,
    eyeTestID,
}) => {
    return (
        <AppInput
            label={label}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            secureTextEntry={!isVisible}
            leftIconName="lock"
            rightIconName={isVisible ? 'eye' : 'eye-off'}
            onRightIconPress={onToggleVisibility}
            error={error}
            testID={testID}
            rightIconTestID={eyeTestID}
        />
    );
};
