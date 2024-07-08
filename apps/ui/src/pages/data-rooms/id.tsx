import { Helmet } from 'react-helmet-async';
import { LoaderFunction, redirect, useLoaderData, useParams } from 'react-router-dom';
import { getDataRoomContent, getUser, isConnected } from '../../utils/api';
import { urlToId } from '../../utils/helpers';
import { DataRoomFile } from '../../utils/types';
import { LockOpen, Lock, File } from 'lucide-react';
import { Dropzone } from '../../components/dropzone';
import { useState } from 'react';
import { loadFile } from '../../utils/fileTools';

type RoomLoaderData = {
    userRole: string;
    dataRoom: {
        locked: boolean;
        files: DataRoomFile[];
    };
};

export const loader: LoaderFunction = async ({ params }) => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const { dataRoomId } = params;

    if (!dataRoomId) return { status: 404 };

    const result = await getDataRoomContent(urlToId(dataRoomId));
    const user = await getUser();
    const isSuper = user.result.roles.find((role) => role.dataRoomId === 'super');

    return {
        dataRoom: result.result,
        userRole: isSuper ? 'admin' : user.result.roles.find((role) => role.dataRoomId === urlToId(dataRoomId))?.role
    };
};

export const DataRoom = () => {
    const { dataRoomId } = useParams<{ dataRoomId: string }>();
    const { userRole, dataRoom } = useLoaderData() as RoomLoaderData;
    const [files, setFiles] = useState<string[]>([]);

    const handleDownload = async (file: DataRoomFile) => {
        const doneFile = await loadFile({
            name: file.name,
            type: file.type,
            size: -1,
            key: file.key,
            digest: file.digestB64,
            token: file.tokenB64,
        }, false);

        const link = document.createElement('a');

        link.download = file.name;
        link.href = doneFile.downloadUrl ?? '#';
        link.target = '_blank';
        link.click();
    };

    return (
        <>
            <Helmet>
                <title>Data Room: {dataRoomId?.substring(0, 8)} | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Data Room ID: {urlToId(dataRoomId ?? '').substring(0, 8)}</h2>
                {userRole === 'admin' ? <Dropzone onChange={setFiles} className="h-48 w-full" /> : null}
                <div className="flex flex-col gap-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        Contents{' '}
                        {dataRoom.locked ? (
                            <>
                                locked <Lock />
                            </>
                        ) : (
                            <>
                                unlocked <LockOpen />
                            </>
                        )}
                    </h2>
                    {dataRoom.files.length === 0 && <p className="italic">No files uploaded yet</p>}
                    {dataRoom.files.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 rounded-lg bg-slate-100 p-4">
                            <File className="h-8 w-8" />
                            <div className="gap flex flex-col">
                                <h3 className="flex items-center gap-2 font-semibold">File name: {file.name}</h3>
                                <p className="text-sm">
                                    <button
                                        onClick={() => { handleDownload(file) }}
                                        className="hover:underline"
                                    >
                                        Download file
                                    </button>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
