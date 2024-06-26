import { Helmet } from 'react-helmet-async';
import { isConnected, listUsers } from '../../utils/api';
import { redirect, useLoaderData } from 'react-router-dom';
import { ListUserRequestsResult } from '../../utils/types';

export const loader = async () => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const res = await listUsers();

    if (res.message === 'No userRequest found in the list of userRequests') {
        return {
            result: []
        };
    }

    return {
        result: res.result
    };
};

export const Users = () => {
    const { result } = useLoaderData() as ListUserRequestsResult;
    return (
        <>
            <Helmet>
                <title>Users | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Users</h2>
                {result.length > 0 ? (
                    <p className="italic">{JSON.stringify(result)}</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="italic">No users found.</p>
                    </div>
                )}
            </div>
        </>
    );
};
