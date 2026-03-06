'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    whatsapp: string;
    role: string;
    balance: number;
    points: number;
    tickets?: number;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isHydrated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    checkAuth: (token: string) => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Load token from local storage on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            checkAuth(storedToken);
        } else {
            setIsLoading(false);
        }
        setIsHydrated(true);
    }, []);

    const checkAuth = async (currentToken: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                // Token invalid or expired
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);

        if (userData.role === 'admin') {
            router.push('/admin');
        } else if (userData.role === 'writer') {
            router.push('/writer');
        } else {
            router.push('/');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const updateUser = (userData: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...userData } : null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isHydrated, login, logout, checkAuth, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

