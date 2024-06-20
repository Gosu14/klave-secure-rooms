import { useRouteError } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const ErrorPage = () => {
    const error = useRouteError();

    return (
        <>
            <Helmet>
                <title>Error | Secure Data Rooms</title>
            </Helmet>
            <div className="flex h-screen flex-col items-center justify-center gap-8">
                <h1 className="text-4xl font-bold">Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p className="text-slate-400">
                    <i>{(error as Error)?.message || (error as { statusText?: string })?.statusText}</i>
                </p>
            </div>
        </>
    );
};
