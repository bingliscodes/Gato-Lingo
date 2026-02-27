import axios, { AxiosError } from 'axios';
import { getErrorMessage } from './helperFunctions';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserCreateRequest {
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  email: string;
  role: string;
  target_language: string | null;
  native_language: string | null;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  native_language: string | null;
  target_language: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface ApiError {
  detail: string;
}

export const login = async (
  loginFormData: FormData,
): Promise<LoginResponse> => {
  try {
    const res = await axios.post<LoginResponse>(
      `${import.meta.env.VITE_API_BASE_URL}auth/login`,
      loginFormData,
      { withCredentials: true },
    );

    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<ApiError>;
      const message = axiosError.response?.data?.detail || 'Login failed';
      throw new Error(message);
    }
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error('An unexpected error occurred');
  }
};

export const signup = async (
  signupCredentials: UserCreateRequest,
): Promise<LoginResponse> => {
  try {
    const res = await axios.post<LoginResponse>(
      `${import.meta.env.VITE_API_BASE_URL}auth/signup`,
      signupCredentials,
      { withCredentials: true },
    );

    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

export const verifyJWT = async (): Promise<User | null> => {
  console.log('verifying jwt...');
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}auth/me`, {
      withCredentials: true,
    });

    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<ApiError>;
      const message = axiosError.response?.data?.detail || 'Login failed';
      throw new Error(message);
    }

    // Handle other errors
    if (err instanceof Error) {
      throw new Error(err.message);
    }

    // Fallback for unknown error types
    throw new Error('An unexpected error occurred');
  }
};

export interface MessageResponse {
  status: string;
  message: string;
}

export const logout = async (): Promise<MessageResponse> => {
  try {
    const res = await axios.get<MessageResponse>(
      `${import.meta.env.VITE_API_BASE_URL}auth/logout`,
      { withCredentials: true },
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};
