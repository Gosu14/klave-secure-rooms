import { Helmet } from 'react-helmet-async';
import { LoaderFunction, redirect, useLoaderData, useParams } from 'react-router-dom';
import { getDataRoomContent, isConnected } from '../../utils/api';
import { urlToId } from '../../utils/helpers';
import { DataRoomContentResult } from '../../utils/types';
import { LockOpen, Lock, File } from 'lucide-react';

export const loader: LoaderFunction = async ({ params }) => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const { dataRoomId } = params;

    if (!dataRoomId) return { status: 404 };

    const result = await getDataRoomContent(urlToId(dataRoomId));
    console.log(result);
    return result;
};

export const DataRoom = () => {
    const { dataRoomId } = useParams<{ dataRoomId: string }>();
    const { result } = useLoaderData() as DataRoomContentResult;

    return (
        <>
            <Helmet>
                <title>Data Room: {dataRoomId?.substring(0, 8)} | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Data Room ID: {urlToId(dataRoomId ?? '').substring(0, 8)}</h2>
                <div className="flex flex-col gap-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        Contents{' '}
                        {/* {result.locked ? (
                            <>
                                locked <Lock />
                            </>
                        ) : (
                            <>
                                unlocked <LockOpen />
                            </>
                        )} */}
                    </h2>
                    {/* {result.files.length === 0 && <p className="italic">No files uploaded yet</p>}
                    {result.files.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 rounded-lg bg-slate-100 p-4">
                            <File className="h-8 w-8" />
                            <div className="gap flex flex-col">
                                <h3 className="flex items-center gap-2 font-semibold">File name: {file.name}</h3>
                                <p className="text-sm">
                                    <a
                                        href={`data:${file.type};base64,${file.tokenB64}`}
                                        download={file.name}
                                        className="hover:underline"
                                    >
                                        Download file
                                    </a>
                                </p>
                            </div>
                        </div>
                    ))} */}
                </div>
            </div>
        </>
    );
};
