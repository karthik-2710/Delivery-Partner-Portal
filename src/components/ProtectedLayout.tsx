import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';
import VerificationPendingPage from '../pages/VerificationPendingPage';

export default function ProtectedLayout() {
    const { currentUser, currentPartner, loading } = useAuth();

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

    // Verification Check
    // If user is logged in, but partner doc is missing or verification is pending/rejected
    if (currentPartner) {
        if (currentPartner.status === 'pending_verification' || currentPartner.status === 'rejected') {
            return <VerificationPendingPage />;
        }
    } else {
        // Logged in but no partner profile? 
        // This handles race conditions or incomplete signups.
        // For robustness, maybe redirect to signup or show a "Profile Not Found" error.
        // Assuming signup always creates profile:
        return <div className="text-white text-center p-10">Initializing Profile...</div>;
        // Or better:
        // return <Navigate to="/signup" />;
    }

    return (
        <div className="min-h-screen bg-partner-bg pb-20">
            <Outlet />
            <BottomNav />
        </div>
    );
}
