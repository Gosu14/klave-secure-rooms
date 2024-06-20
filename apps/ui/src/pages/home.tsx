import { Helmet } from 'react-helmet-async';
import { Dropzone } from '../components/dropzone';
import { useState } from 'react';

export const Home = () => {
    const [files, setFiles] = useState<string[]>([]);

    return (
        <>
            <Helmet>
                <title>Home | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 py-4 px-12">
                <h1 className="text-lg font-semibold">Start uploading your files</h1>
                <Dropzone onChange={setFiles} className="w-full h-48" fileExtension="pdf" />
            </div>
        </>
    );
};

// encrypt the file
// send to enclave and sign the content, verify it's indeed the same file
