import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedLayout from './components/ProtectedLayout';
import Login from './pages/Login';
import Signup from './pages/SignupPage';
import Dashboard from './pages/DashboardPage';
import Orders from './pages/OrdersPage';
import ActiveDeliveries from './pages/ActiveDeliveriesPage';
import Wallet from './pages/WalletPage';
import Profile from './pages/ProfilePage';
import Preferences from './pages/PreferencesPage';
import ManualOrder from './pages/ManualOrderPage';
import { AnimatePresence } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/active" element={<ActiveDeliveries />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/create-order" element={<ManualOrder />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
