import { Helmet } from 'react-helmet-async';
import { createDataRoom, isConnected, listDataRooms } from '../../utils/api';
import { redirect, useLoaderData, useNavigate } from 'react-router-dom';
import { ListDataRoomsResult } from '../../utils/types';
import { Button } from '@klave-secure-rooms/ui-kit/ui';
import { Plus } from 'lucide-react';

export const loader = async () => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const res = await listDataRooms();

    if (res.message === 'No dataroom found in the list of dataRooms') {
        return {
            result: []
        };
    }

    return {
        result: res.result
    };
};

export const Admin = () => {
    const navigate = useNavigate();
    const { result } = useLoaderData() as ListDataRoomsResult;

    const handleCreateDataRoom = async () => {
        await createDataRoom().catch((error) => {
            console.log(error);
            return error;
        });
        navigate('/admin/data-rooms');
    };

    return (
        <>
            <Helmet>
                <title>Admin | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Home</h2>
                {result.length > 0 ? (
                    <p className="italic">Welcome to Data Rooms App!</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className="italic">No data rooms found. Please create one by clicking the button below.</p>
                        <Button className="w-48 transition-colors hover:bg-slate-700" onClick={handleCreateDataRoom}>
                            Create data room
                            <Plus className="ml-2 h-6 w-6" />
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};
