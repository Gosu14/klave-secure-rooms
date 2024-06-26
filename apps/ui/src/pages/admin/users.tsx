import { Helmet } from 'react-helmet-async';

export const Users = () => {

    return (
        <>
            <Helmet>
                <title>Users | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Users</h2>
            </div>
        </>
    );
};
