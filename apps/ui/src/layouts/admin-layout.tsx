import { Outlet, redirect } from 'react-router-dom';
import { AdminHeader } from '../components/admin-header';
import { isConnected } from '../utils/api';
import { SideNav } from '../components/side-nav';

export const loader = async () => {
    const isConnectedState = isConnected();
    if (!isConnectedState) {
        return redirect('/auth');
    }
};

export const AdminLayout = () => {
    return (
        <div className="grid grid-cols-12 divide-x divide-slate-400">
            <div className="col-span-1 md:col-span-2">
                <SideNav />
            </div>
            <div className="col-span-11 h-screen overflow-y-auto md:col-span-10">
                <AdminHeader />
                <Outlet />
            </div>
        </div>
    );
};
