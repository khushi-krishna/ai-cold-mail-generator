import React from 'react';
import { useAuth } from '../context/authContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="navbar">
            {/* Left — greeting or mobile logo */}
            <div className="navbar-left">
                <span className="navbar-greeting hidden-mobile">
                    Good day, <strong>{user?.name || 'User'}</strong>
                </span>
                <span className="navbar-logo mobile-only">Outreach.ai</span>
            </div>

            {/* Right — avatar + logout */}
            <div className="navbar-right">
                <div className="navbar-avatar" title={user?.name}>{initials}</div>

                <div className="navbar-divider" />

                <button className="navbar-logout" onClick={logout}>
                    <ArrowLeftOnRectangleIcon className="navbar-logout-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;