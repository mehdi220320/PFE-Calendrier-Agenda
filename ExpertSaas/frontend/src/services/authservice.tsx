import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${backendURL}/api/auth`,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface AuthResponse {
    message: string;
    token: string;
    expiresIn: number;
    role: string;
    isActive: boolean;
    email: string;
    firstname: string;
    lastname: string;
    userId: string;
    picture: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', credentials);
        const data = response.data;

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('isActive', String(data.isActive));
        localStorage.setItem('email', data.email);
        localStorage.setItem('firstname', data.firstname);
        localStorage.setItem('lastname', data.lastname);
        localStorage.setItem('user', data.userId);
        localStorage.setItem('picture', data.picture);

        const expirationTime = Date.now() + (data.expiresIn * 1000);
        localStorage.setItem('tokenExpiration', expirationTime.toString());

        return data;
    },

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('isActive');
        localStorage.removeItem('email');
        localStorage.removeItem('firstname');
        localStorage.removeItem('lastname');
        localStorage.removeItem('userId');
        localStorage.removeItem('picture');
        localStorage.removeItem('tokenExpiration');
    },


    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        const expiration = localStorage.getItem('tokenExpiration');

        if (!token || !expiration) {
            return false;
        }

        const isExpired = Date.now() > parseInt(expiration);

        if (isExpired) {
            this.logout();
            return false;
        }

        return true;
    },

    getUserRole(): string | null {
        return localStorage.getItem('role');
    },


    getToken(): string | null {
        return localStorage.getItem('token');
    },

    getUserInfo(): {
        email: string | null;
        firstname: string | null;
        lastname: string | null;
        userId: string | null;
        picture: string | null;
        role: string | null;
        isActive: boolean;
    } {
        return {
            email: localStorage.getItem('email'),
            firstname: localStorage.getItem('firstname'),
            lastname: localStorage.getItem('lastname'),
            userId: localStorage.getItem('user'),
            picture: localStorage.getItem('picture'),
            role: localStorage.getItem('role'),
            isActive: localStorage.getItem('isActive') === 'true',
        };
    },
};

