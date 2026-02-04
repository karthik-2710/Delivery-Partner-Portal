import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

export default function ProtectedLayout() {
    const { currentUser, currentPartner, loading } = useAuth() || {};

    if (loading) return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontFamily: 'sans-serif'
        }}>
            LOADING PARTNER APP...
        </div>
    );

    if (!currentUser) return <Navigate to="/login" />;

    // Optional: Strictly block if no partner profile, but might want to allow them to "Complete Profile"
    // For now, if logged in but no partner profile, let's redirect to signup or show a "Pending" screen.
    // Simplifying: If no partner profile, redirect to signup? Or just let them be (might need to handle "pending" status).
    if (currentUser && !currentPartner) {
        // Could redirect to a 'complete-profile' page. For now, we'll assume signup creates it instantly.
        // If we strictly redirect, we might loop if signup page is not protected.
    }

    return (
        <div className="min-h-screen bg-partner-bg pb-20">
            <Outlet />
            <BottomNav />
        </div>
    );
}
