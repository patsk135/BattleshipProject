import './Admin.css';
import React, { useState, useEffect } from 'react';
import { socket } from './socket';

import { AdminPage } from './AdminPage';
import { LoginModalAdmin } from './components/LoginModalAdmin';

export const Admin = () => {
    const [showLoginAdmin, setShowLoginAdmin] = useState(true);
    const closeShowLoginAdmin = () => setShowLoginAdmin(false);
    const openShowLoginAdmin = () => setShowLoginAdmin(true);

    useEffect(() => {
        openShowLoginAdmin();
        socket.on('loginSuccess', () => {
            closeShowLoginAdmin();
        });
        socket.on('loginFail', () => {
            alert('wrong username or password');
        });
    }, []);

    return (
        <div className='adminContainer'>
            {showLoginAdmin ? <LoginModalAdmin close={closeShowLoginAdmin} /> : <AdminPage />}
        </div>
    );
};
