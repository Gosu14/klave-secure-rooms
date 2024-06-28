import secretariumHandler from '../utils/secretarium-handler';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@klave-secure-rooms/ui-kit/ui';
import { FolderKey, KeyRound, LogOut, TestTube, Users } from 'lucide-react';

export const SideNav = () => {
    const navigate = useNavigate();
    return (
        <div className="flex h-full flex-col gap-2 bg-slate-100 px-2 py-4">
            <div className="px-2 pb-8">
                <NavLink to="/admin" className="text-xl font-semibold">
                    Data Rooms
                </NavLink>
            </div>
            <NavLink
                to="/admin/keys"
                className={({ isActive }) =>
                    `flex items-center gap-4 rounded-lg p-2 text-xl ${
                        isActive
                            ? 'bg-blue-200 text-blue-600'
                            : 'transition-colors hover:bg-blue-100 hover:text-blue-500'
                    }`
                }
            >
                <KeyRound />
                Keys
            </NavLink>
            <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                    `flex items-center gap-4 rounded-lg p-2 text-xl ${
                        isActive
                            ? 'bg-blue-200 text-blue-600'
                            : 'transition-colors hover:bg-blue-100 hover:text-blue-500'
                    }`
                }
            >
                <Users />
                Users
            </NavLink>
            <NavLink
                to="/admin/data-rooms"
                className={({ isActive }) =>
                    `flex items-center gap-4 rounded-lg p-2 text-xl ${
                        isActive
                            ? 'bg-blue-200 text-blue-600'
                            : 'transition-colors hover:bg-blue-100 hover:text-blue-500'
                    }`
                }
            >
                <FolderKey />
                Rooms
            </NavLink>
            {/* <NavLink
                to="/admin/test"
                className={({ isActive }) =>
                    `flex items-center gap-4 rounded-lg p-2 text-xl ${
                        isActive
                            ? 'bg-blue-200 text-blue-600'
                            : 'transition-colors hover:bg-blue-100 hover:text-blue-500'
                    }`
                }
            >
                <TestTube />
                Test
            </NavLink> */}
            <Button
                onClick={() => secretariumHandler.disconnect().then(() => navigate('/auth'))}
                variant="ghost"
                className="mt-auto flex items-center gap-4 rounded-lg p-2 text-xl font-semibold transition-colors hover:bg-blue-100 hover:text-blue-500"
            >
                <LogOut />
                Logout
            </Button>
        </div>
    );
};
