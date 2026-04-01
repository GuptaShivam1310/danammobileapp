export interface IUserProfile {
    id: string;
    full_name: string;
    email: string;
    profile_image_url: string | null;
    phone_number?: string;
    country_code?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
}

export interface IUpdateUserRequest {
    full_name?: string;
    email?: string;
    profile_image_url?: string;
    phone_number?: string;
    country_code?: string;
}

export interface IUpdateUserResponse {
    success: boolean;
    message: string;
    data: IUserProfile;
}

export interface IDeleteUserResponse {
    success: boolean;
    message: string;
}

export interface IDeleteAccountRequest {
    password?: string;
}

export interface IChangePasswordRequest {
    current_password?: string;
    new_password?: string;
    confirm_password?: string;
}

export interface IUpdateSettingsRequest {
    receiveUpdates?: boolean;
    nearestDanam?: boolean;
    hideIdentity?: boolean;
}

export interface IContactUsRequest {
    name: string;
    email: string;
    phoneNumber?: string;
    message: string;
    phone_country_code?: string;
}
