import { Crown, FileLock2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminHeader = () => {
    return (
        <header className="sticky top-0 w-full border-b border-slate-400 bg-slate-100">
            <div className="flex justify-end px-12 py-4">
                <div className="flex items-center gap-2">
                    <Crown />
                    <span className="text-xl font-semibold">Super Admin</span>
                </div>
            </div>
        </header>
    );
};
