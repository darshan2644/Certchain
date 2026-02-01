import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { role: 'admin' | 'student', address?: string, username?: string, studentId?: string }

    useEffect(() => {
        const savedUser = localStorage.getItem('certchain_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const loginAdmin = (username, password) => {
        if (username === 'admin' && password === 'darshan_dav') {
            const adminUser = { role: 'admin', username: 'Darshan Vasoya' };
            setUser(adminUser);
            localStorage.setItem('certchain_user', JSON.stringify(adminUser));
            return true;
        }
        return false;
    };

    const loginStudent = (address) => {
        const studentUser = { role: 'student', address };
        setUser(studentUser);
        localStorage.setItem('certchain_user', JSON.stringify(studentUser));
    };

    const loginStudentById = (studentId) => {
        const studentUser = { role: 'student', studentId };
        setUser(studentUser);
        localStorage.setItem('certchain_user', JSON.stringify(studentUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('certchain_user');
    };

    return (
        <AuthContext.Provider value={{ user, loginAdmin, loginStudent, loginStudentById, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
