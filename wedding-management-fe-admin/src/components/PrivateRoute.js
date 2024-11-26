import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import AuthService from '../service/auth-service';
import axios from 'axios';

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    const isAuthenticated = AuthService.checkRoleUser();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute; 