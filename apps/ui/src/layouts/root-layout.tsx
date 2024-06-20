import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <Outlet />
        </div>
    );
};
