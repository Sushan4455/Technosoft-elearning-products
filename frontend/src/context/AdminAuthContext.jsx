import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
    const [currentAdmin, setCurrentAdmin] = useState(() => {
        try {
            const stored = localStorage.getItem('adminUser');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Failed to parse admin user", e);
            return null;
        }
    });
    
    // Since we initialize synchronously from localStorage, we don't need a loading state for the auth check itself
    // But we keep the interface consistent
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const login = (email, password) => {
        if (email === 'info.technosoftintl@gmail.com' && password === 'Technosoftintl@1470#') {
            const adminUser = { email, role: 'superadmin' };
            setCurrentAdmin(adminUser);
            localStorage.setItem('adminUser', JSON.stringify(adminUser));
            return true;
        }
        throw new Error('Invalid Admin Credentials');
    };

    const logout = () => {
        setCurrentAdmin(null);
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    return (
        <AdminAuthContext.Provider value={{ currentAdmin, login, logout, loading }}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
}
