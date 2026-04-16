import React from 'react';
import { useAuth } from '../context/authContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();

    const getInitials = (user) => {
        if (user?.username) {
            return user.username[0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return 'U';
    };

    const initials = getInitials(user);

    return (
        <header className="navbar">
            {/* Left — greeting or mobile logo */}
            <div className="navbar-left">
              <span className="navbar-greeting hidden-mobile">
             Good day, <strong>{user?.username || 'User'}</strong>
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