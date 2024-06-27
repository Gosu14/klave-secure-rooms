import { Button } from '@klave-secure-rooms/ui-kit/ui';
import { FileLock2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import secretariumHandler from '../utils/secretarium-handler';

export const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 w-full border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between px-12 py-4">
                <Link to="/" className="flex items-center gap-2 transition-colors hover:text-slate-500">
                    <FileLock2 />
                    <span className="text-xl font-semibold">Secure Data Rooms</span>
                </Link>
                <Button
                    onClick={() => secretariumHandler.disconnect().then(() => navigate('/auth'))}
                    variant="ghost"
                    className="mt-auto flex items-center gap-2 rounded-lg p-2 text-xl font-semibold transition-colors hover:bg-blue-100 hover:text-blue-500"
                >
                    <LogOut />
                    Logout
                </Button>
            </div>
        </header>
    );
};
