import { Helmet } from 'react-helmet-async';
import { approveUser, isConnected, listUsers } from '../../utils/api';
import { redirect, useLoaderData, useRevalidator } from 'react-router-dom';
import { ListUserRequestsResult } from '../../utils/types';
import { Button } from '@klave-secure-rooms/ui-kit/ui';
import { useState } from 'react';

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
    const revalidator = useRevalidator();
    console.log(result);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleApproveUser = async (id: string) => {
        const result = await approveUser({ userRequestId: id });

        if (result.success) {
            revalidator.revalidate();
            setSuccessMsg(result.message);
            setError(null);
        } else {
            setError(result.message);
            setSuccessMsg(null);
        }
    };

    return (
        <>
            <Helmet>
                <title>Users | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Users</h2>
                {result.length > 0 ? (
                    <>
                        {result.map((user) => (
                            <div
                                key={user}
                                className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 p-4"
                            >
                                <h3 className="font-semibold">User ID: {user.substring(0, 8)}</h3>
                                <Button onClick={() => handleApproveUser(user)}>Approve</Button>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="italic">No users found.</p>
                    </div>
                )}
                {error && <p className="overflow-clip text-red-500">{error}</p>}
                {successMsg && <p className="overflow-clip text-green-500">{successMsg}</p>}
            </div>
        </>
    );
};
