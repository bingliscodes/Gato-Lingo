import axios from 'axios'

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
    };
}

export const login = async(credentials: LoginCredentials): Promise<AuthResponse> => {
    const {email, password} = credentials;

    try {
        const loggedInUser = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}users/login`,
            {email, password},
            {withCredentials: true},
        )

        if (!loggedInUser.ok){
            const error = await loggedInUser.json();
            throw new Error(error.detail || "Login failed");
        }
    }
}