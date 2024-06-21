import { Helmet } from 'react-helmet-async';
import { Dropzone } from '../components/dropzone';
import { useState } from 'react';
import { listDataRooms } from '../utils/api';
import { NavLink, useLoaderData } from 'react-router-dom';
import { ListDataRoomsResult } from '../utils/types';
import { idToUrl } from '../utils/helpers';

export const loader = async () => {
    const { result } = await listDataRooms();

    return {
        result
    };
};

export const Home = () => {
    const { result } = useLoaderData() as ListDataRoomsResult;
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

// encrypt the file
// send to enclave and sign the content, verify it's indeed the same file
