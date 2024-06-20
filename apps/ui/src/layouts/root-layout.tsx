import { Outlet } from 'react-router-dom';
import { Header } from '../components/header';

export const RootLayout = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <Outlet />
        </div>
    );
};
