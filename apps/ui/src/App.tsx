import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Home } from '@/pages/home';
import { ErrorPage } from '@/pages/error-page';
import { RootLayout } from '@/layouts/root-layout';
import secretariumHandler from '@/utils/secretarium-handler';

secretariumHandler.initialize();

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Home />
            }
        ]
    }
]);

const App = () => {
    return (
        <HelmetProvider>
            <RouterProvider router={router} />
        </HelmetProvider>
    );
};

export default App;
