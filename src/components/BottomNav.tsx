import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Navigation, Wallet, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Package, label: 'Orders', path: '/orders' },
        { icon: Navigation, label: 'Active', path: '/active' },
        { icon: Wallet, label: 'Wallet', path: '/wallet' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-partner-card border-t border-white/5 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-partner-primary" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <item.icon className={clsx("w-6 h-6", isActive && "fill-current/20")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
