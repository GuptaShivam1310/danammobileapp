import { renderHook, act } from '@testing-library/react-native';
import { useEditProfile } from '../../src/screens/EditProfile/useEditProfile';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { updateProfile, fetchProfile } from '../../src/store/slices/profileSlice';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../src/store', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('../../src/store/slices/profileSlice', () => ({
  updateProfile: jest.fn(),
  fetchProfile: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});


describe('useEditProfile', () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  const mockUserProfile = {
    full_name: 'John Doe',
    email: 'john@example.com',
    phone_number: '1234567890',
    country_code: '+91',
    profile_image_url: 'http://image.com/img.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
    });
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        profile: {
          user: mockUserProfile,
        },
      })
    );
  });


  it('initializes with correctly parsed names from userProfile', () => {
    const { result } = renderHook(() => useEditProfile());

    expect(result.current.firstName).toBe('John');
    expect(result.current.lastName).toBe('Doe');
    expect(result.current.email).toBe('john@example.com');
    expect(result.current.phoneNumber).toBe('1234567890');
    expect(result.current.countryCode).toBe('+91');
    expect(result.current.profileImage).toBe('http://image.com/img.jpg');
  });

  it('handles name with multiple parts correctly', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        profile: {
          user: {
            full_name: 'John Quincy Adams',
            email: 'john@example.com',
          },
        },
      })
    );

    const { result } = renderHook(() => useEditProfile());

    expect(result.current.firstName).toBe('John');
    expect(result.current.lastName).toBe('Quincy Adams');
  });

  it('validates required fields', async () => {
    const { result } = renderHook(() => useEditProfile());

    await act(async () => {
      result.current.setFirstName('');
      result.current.setLastName('');
      result.current.setEmail('');
      result.current.setPhoneNumber('');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.errors).toEqual({
      firstName: 'validation.firstNameRequired',
      lastName: 'validation.lastNameRequired',
      email: 'validation.emailRequired',
      phoneNumber: 'validation.phoneRequired',
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const { result } = renderHook(() => useEditProfile());

    await act(async () => {
      result.current.setEmail('invalid-email');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(result.current.errors.email).toBe('validation.emailInvalidFormat');
  });

  it('successfully saves profile', async () => {
    const { result } = renderHook(() => useEditProfile());
    
    const mockResponse = { type: 'profile/update/fulfilled' };
    (updateProfile as unknown as jest.Mock).mockReturnValue('mockUpdateAction');
    (updateProfile as any).fulfilled = { match: (res: any) => res.type === 'profile/update/fulfilled' };
    mockDispatch.mockResolvedValue(mockResponse);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockDispatch).toHaveBeenCalledWith('mockUpdateAction');
    expect(fetchProfile).toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('alerts.success', 'alerts.profileUpdated');
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('handles save failure', async () => {
    const { result } = renderHook(() => useEditProfile());
    
    const mockResponse = { type: 'profile/update/rejected', payload: 'Error updating' };
    (updateProfile as unknown as jest.Mock).mockReturnValue('mockUpdateAction');
    (updateProfile as any).fulfilled = { match: (res: any) => res.type === 'profile/update/fulfilled' };
    mockDispatch.mockResolvedValue(mockResponse);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(Alert.alert).toHaveBeenCalledWith('alerts.error', 'Error updating');
  });

  it('handles unexpected error during save', async () => {
      const { result } = renderHook(() => useEditProfile());
      
      mockDispatch.mockRejectedValue(new Error('Network Error'));
  
      await act(async () => {
        await result.current.handleSave();
      });
  
      expect(Alert.alert).toHaveBeenCalledWith('alerts.error', 'Network Error');
    });

  it('handles userProfile being null', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({ profile: { user: null } })
    );

    const { result } = renderHook(() => useEditProfile());

    expect(result.current.firstName).toBe('');
    expect(result.current.email).toBe('');
  });

  it('handles missing fields in userProfile', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        profile: {
          user: {
            // full_name missing
            email: 'john@example.com',
          },
        },
      })
    );

    const { result } = renderHook(() => useEditProfile());

    expect(result.current.firstName).toBe('');
    expect(result.current.lastName).toBe('');
  });

  it('successfully saves profile with missing profileImage', async () => {
    const { result } = renderHook(() => useEditProfile());
    
    await act(async () => {
      result.current.setProfileImage('');
    });

    const mockResponse = { type: 'profile/update/fulfilled' };
    (updateProfile as unknown as jest.Mock).mockReturnValue('mockUpdateAction');
    (updateProfile as any).fulfilled = { match: (res: any) => res.type === 'profile/update/fulfilled' };
    mockDispatch.mockResolvedValue(mockResponse);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(mockDispatch).toHaveBeenCalledWith('mockUpdateAction');
  });

  it('handles save failure without message in payload', async () => {
    const { result } = renderHook(() => useEditProfile());
    
    const mockResponse = { type: 'profile/update/rejected' }; // No payload
    (updateProfile as unknown as jest.Mock).mockReturnValue('mockUpdateAction');
    (updateProfile as any).fulfilled = { match: (res: any) => res.type === 'profile/update/fulfilled' };
    mockDispatch.mockResolvedValue(mockResponse);

    await act(async () => {
      await result.current.handleSave();
    });

    expect(Alert.alert).toHaveBeenCalledWith('alerts.error', 'alerts.failedToUpdateProfile');
  });

  it('handles unexpected error without message', async () => {
    const { result } = renderHook(() => useEditProfile());
    
    mockDispatch.mockRejectedValue({});

    await act(async () => {
      await result.current.handleSave();
    });

    expect(Alert.alert).toHaveBeenCalledWith('alerts.error', 'errors.generic');
  });

  it('handles single name correctly', () => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        profile: {
          user: {
            full_name: 'John',
          },
        },
      })
    );

    const { result } = renderHook(() => useEditProfile());

    expect(result.current.firstName).toBe('John');
    expect(result.current.lastName).toBe('');
  });

  it('handles back navigation', () => {
    const { result } = renderHook(() => useEditProfile());

    act(() => {
      result.current.handleBack();
    });

    expect(mockGoBack).toHaveBeenCalled();
  });
});


