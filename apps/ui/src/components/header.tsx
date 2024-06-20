import { FileLock2 } from 'lucide-react';

export const Header = () => {
    return (
        <header className="sticky top-0 w-full border-b border-slate-200 bg-slate-50">
            <div className="flex py-4 px-12">
                <div className="flex items-center gap-2">
                    <FileLock2 />
                    <span className="text-xl font-semibold">Secure Data Rooms</span>
                </div>
            </div>
        </header>
    );
};
