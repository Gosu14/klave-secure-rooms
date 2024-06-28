import { Helmet } from 'react-helmet-async';
import { createUser, getUser, isConnected, listDataRooms } from '../utils/api';
import { Link, redirect, useLoaderData, useRevalidator } from 'react-router-dom';
import { Button } from '@klave-secure-rooms/ui-kit/ui';
import { useState } from 'react';
import { idToUrl } from '../utils/helpers';

type DataRoomRole = {
    dataRoomId: string;
    role: string;
};

type HomeLoaderData = {
    dataRooms: string[];
    userRoles: DataRoomRole[];
};

export const loader = async () => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const user = await getUser();
    const dataRooms = await listDataRooms();
    console.log(user, dataRooms);
    if (user.message === 'User not found') {
        return {
            dataRooms: dataRooms.result,
            userRoles: []
        };
    }

    if (user.result.roles.find((role) => role.dataRoomId === 'super')) {
        return redirect('/admin');
    }

    return {
        dataRooms: dataRooms.result,
        userRoles: user.result.roles
    };
};

export const Home = () => {
    const { dataRooms, userRoles } = useLoaderData() as HomeLoaderData;
    const revalidator = useRevalidator();

    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleJoinAsMember = async (id: string) => {
        const result = await createUser({ dataRoomId: id, role: 'user' });

        if (result.success) {
            revalidator.revalidate();
            setSuccessMsg(result.message);
            setError(null);
        } else {
            setError(result.message);
            setSuccessMsg(null);
        }
    };

    const handleJoinAsAdmin = async (id: string) => {
        const result = await createUser({ dataRoomId: id, role: 'admin' });

        if (result.success) {
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
                <title>Home | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <div className="flex flex-col gap-2">
                    {dataRooms.length > 0 ? (
                        <>
                            <h2 className="text-lg font-semibold">Available data rooms</h2>{' '}
                            {dataRooms.map((id) => (
                                <div
                                    key={id}
                                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 p-4"
                                >
                                    <h3 className="font-semibold">Data room ID: {id.substring(0, 8)}</h3>
                                    {userRoles.find((role) => role.dataRoomId === id) ? (
                                        <div className="flex items-center gap-4">
                                            <p className="italic">
                                                Your status is: {userRoles.find((role) => role.dataRoomId === id)?.role}
                                            </p>
                                            {userRoles.find((role) => role.dataRoomId === id)?.role !== 'pending' ? (
                                                <Link to={`/data-rooms/${idToUrl(id)}`}>
                                                    <Button>View data room</Button>
                                                </Link>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <div className="flex gap-4">
                                            <Button onClick={() => handleJoinAsAdmin(id)}>Request admin access</Button>
                                            <Button onClick={() => handleJoinAsMember(id)}>Join as member</Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="italic">No data rooms found.</p>
                    )}
                </div>
                {error && <p className="overflow-clip text-red-500">{error}</p>}
                {successMsg && <p className="overflow-clip text-green-500">{successMsg}</p>}
            </div>
        </>
    );
};
