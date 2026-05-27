export interface LoginInput {
    email: string;
    password: string;
}

export interface JwtPayload {
    id: string;
    email: string;
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
    };
    token: string;
}