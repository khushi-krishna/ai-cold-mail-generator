import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const INACTIVITY_LIMIT = 7 * 24 * 60 * 60 * 1000; // 1 week in ms

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        localStorage.removeItem('lastActive');
        setUser(null);
    }, []);

    // ── Update last active timestamp on user activity ──
    const updateLastActive = useCallback(() => {
        localStorage.setItem('lastActive', Date.now().toString());
    }, []);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                // ── Check if user has been inactive for more than a week ──
                const lastActive = localStorage.getItem('lastActive');
                if (lastActive && Date.now() - parseInt(lastActive) > INACTIVITY_LIMIT) {
                    // Inactive too long — log them out
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('token');
                    localStorage.removeItem('lastActive');
                } else {
                    setUser(JSON.parse(userInfo));
                    updateLastActive(); // refresh on load
                }
            } catch (e) {
                localStorage.removeItem('userInfo');
            }
        }
        setLoading(false);
    }, []);

    // ── Track activity events ──
    useEffect(() => {
        if (!user) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, updateLastActive));

        return () => {
            events.forEach(e => window.removeEventListener(e, updateLastActive));
        };
    }, [user, updateLastActive]);

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        localStorage.setItem('lastActive', Date.now().toString()); 
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};