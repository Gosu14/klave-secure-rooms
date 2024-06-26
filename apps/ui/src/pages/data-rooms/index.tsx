import { Helmet } from 'react-helmet-async';
import { LoaderFunction, NavLink, redirect, useLoaderData, useParams } from 'react-router-dom';
import { isConnected, listDataRooms } from '../../utils/api';
import { idToUrl, urlToId } from '../../utils/helpers';
import { ListDataRoomsResult } from '../../utils/types';
import { LockOpen, Lock, File } from 'lucide-react';

export const loader: LoaderFunction = async () => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const { result } = await listDataRooms();

    return {
        result
    };
};

export const DataRooms = () => {
    const { result } = useLoaderData() as ListDataRoomsResult;
    console.log(result);
    return (
        <>
            <Helmet>
                <title>Data Rooms | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Available Data Rooms</h2>
                <div className="flex flex-col gap-2">
                    {result.map((id) => (
                        <NavLink
                            to={`/data-rooms/${idToUrl(id)}`}
                            key={id}
                            className="flex flex-col gap-2 rounded-lg bg-slate-100 p-4 transition-colors hover:bg-slate-200"
                        >
                            <h3 className="font-semibold">Data room ID: {id.substring(0, 8)}</h3>
                            <p className="text-sm">Click to view contents</p>
                        </NavLink>
                    ))}
                </div>
            </div>
        </>
    );
};
