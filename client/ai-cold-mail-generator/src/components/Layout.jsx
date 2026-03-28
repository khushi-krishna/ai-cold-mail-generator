import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

const Layout = () => {
    return (
        <div className="layout-root">
            <Sidebar />
            <div className="layout-body">
                <Navbar />
                <main className="layout-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;