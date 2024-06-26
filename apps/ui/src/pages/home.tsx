import { Helmet } from 'react-helmet-async';
import { Dropzone } from '../components/dropzone';
import { useState } from 'react';
import { getUser, isConnected, listDataRooms } from '../utils/api';
import { NavLink, redirect, useLoaderData } from 'react-router-dom';
import { GetUserContentResult, ListDataRoomsResult } from '../utils/types';
import { idToUrl } from '../utils/helpers';

export const loader = async () => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const { result } = await getUser();

    if (result.roles.find(role => role.dataRoomId === 'super')) {
        return redirect('/admin');
    }

    return {
        result
    };
};

export const Home = () => {
    const { result } = useLoaderData() as GetUserContentResult;
    const [files, setFiles] = useState<string[]>([]);

    return (
        <>
            <Helmet>
                <title>Home | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Start uploading your files</h2>
                <Dropzone onChange={setFiles} className="h-48 w-full" fileExtension="pdf" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Available data rooms</h2>
                    {/* {result.map((id) => (
                        <NavLink
                            to={`/data-rooms/${idToUrl(id)}`}
                            key={id}
                            className="flex flex-col gap-2 rounded-lg bg-slate-100 p-4 transition-colors hover:bg-slate-200"
                        >
                            <h3 className="font-semibold">Data room ID: {id.substring(0, 8)}</h3>
                            <p className="text-sm">Click to view contents</p>
                        </NavLink>
                    ))} */}
                </div>
            </div>
        </>
    );
};
