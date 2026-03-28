import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const NAV_ITEMS = [
    { to: '/dashboard', icon: HomeIcon,         label: 'Dashboard' },
    { to: '/history',   icon: DocumentTextIcon, label: 'History'   },
];

const Sidebar = () => {
    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo-wrap">
                <span className="sidebar-logo">Outreach<span>.ai</span></span>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <span className="sidebar-section-label">Menu</span>

                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <Icon className="sidebar-link-icon" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <span className="sidebar-footer-tag">MERN · React</span>
            </div>
        </aside>
    );
};

export default Sidebar;