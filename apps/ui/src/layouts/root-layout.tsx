import { Outlet, redirect } from 'react-router-dom';
import { Header } from '../components/header';
import { isConnected } from '../utils/api';

export const loader = async () => {
    const isConnectedState = isConnected();
    if (!isConnectedState) {
        return redirect('/auth');
    }
};

export const RootLayout = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <Outlet />
        </div>
    );
};
