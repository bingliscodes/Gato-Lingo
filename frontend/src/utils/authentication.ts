import axios, { AxiosError } from 'axios'

interface LoginCredentials {
    email: string;
    password: string;
}

interface AuthResponse {
    status: string;
    token: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        native_language: string | null;
        target_language: string | null;
        created_at: string
        updated_at: string | null

    };
}

interface UserResponse {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    native_language: string | null;
    target_language: string | null;
    created_at: string
    updated_at: string | null
}


interface ApiError{
    detail: string;
}

export const login = async(credentials: LoginCredentials): Promise<AuthResponse> => {
    const {email, password} = credentials;

    try {
        const res = await axios.post<AuthResponse>(
            `${import.meta.env.VITE_API_BASE_URL}auth/login`,
            {email, password},
            {withCredentials: true},
        );

        return res.data;

    } catch(err){
        // Handle Axios-specific errors
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError<ApiError>;
            const message = axiosError.response?.data?.detail || "Login failed";
            throw new Error(message);
        }
        
        // Handle other errors
        if (err instanceof Error) {
            throw new Error(err.message);
        }
        
        // Fallback for unknown error types
        throw new Error("An unexpected error occurred");
    }
};

export const verifyJWT = async (): Promise<UserResponse>=> {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}auth/me`,
      {
        withCredentials: true,
      }
    );
    return res.data;

  } catch (err) {
        if (axios.isAxiosError(err)) {
            const axiosError = err as AxiosError<ApiError>;
            const message = axiosError.response?.data?.detail || "Login failed";
            throw new Error(message);
        }
        
        // Handle other errors
        if (err instanceof Error) {
            throw new Error(err.message);
        }
        
        // Fallback for unknown error types
        throw new Error("An unexpected error occurred");
  }
};
