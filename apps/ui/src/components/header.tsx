import { FileLock2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
    return (
        <header className="sticky top-0 w-full border-b border-slate-200 bg-slate-50">
            <div className="flex px-12 py-4">
                <Link to="/" className="flex items-center gap-2 transition-colors hover:text-slate-500">
                    <FileLock2 />
                    <span className="text-xl font-semibold">Secure Data Rooms</span>
                </Link>
            </div>
        </header>
    );
};
