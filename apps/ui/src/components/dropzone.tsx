import React, { useRef, useState } from 'react';
import { Button, Card, CardContent } from '@klave-secure-rooms/ui-kit/ui';
import { prepareFile } from '../utils/fileTools';
import { getFileUploadToken, updateDataRoom } from '../utils/api';
import { urlToId } from '../utils/helpers';
import { useParams } from 'react-router-dom';
import { Utils } from '@secretarium/connector';

// Define the props expected by the Dropzone component
interface DropzoneProps {
    onChange: React.Dispatch<React.SetStateAction<string[]>>;
    onCompleted?: () => void;
    className?: string;
    fileExtension?: string;
}

const workPromises: Array<Promise<any>> = [];

// Create the Dropzone component receiving props
export function Dropzone({ onChange, onCompleted, className, fileExtension, ...props }: DropzoneProps) {
    // Initialize state variables using the useState hook
    const { dataRoomId } = useParams<{ dataRoomId: string }>();
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to file input element
    const [fileInfo, setFileInfo] = useState<string | null>(null); // Information about the uploaded file
    const [error, setError] = useState<string | null>(null); // Error message state

    // Function to handle drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Function to handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const { files } = e.dataTransfer;
        handleFiles(files);
    };

    // Function to handle file input change event
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files) {
            handleFiles(files);
        }
    };

    // Function to handle processing of uploaded files
    const handleFiles = (files: FileList) => {

        if (!fileInputRef.current)
            return;

        Array.from(files).forEach((file) => {
            workPromises.push((async () => {
                const { encryptedBlob, digest, key } = await prepareFile(file);

                if (!encryptedBlob || !key || !digest)
                    return Promise.reject('Error preparing file for upload');

                const uploadToken = await getFileUploadToken({
                    dataRoomId: urlToId(dataRoomId ?? ''),
                    digestB64: digest,
                })

                const data = new FormData();
                data.append('token', uploadToken.result.tokenB64)
                data.append('file', encryptedBlob)

                const rawResponse = await fetch('/api/file', {
                    method: 'POST',
                    body: data,
                })
                const response = await rawResponse.json();
                
                await updateDataRoom({
                    dataRoomId: urlToId(dataRoomId ?? ''),
                    operation: 'addFile',
                    file: {
                        digestB64: digest,
                        name: file.name,
                        type: file.type,
                        key: key,
                        tokenB64: response.uploadToken
                    }
                })

                if (fileInputRef.current)
                    fileInputRef.current.value = '';

                onCompleted?.();

            })());
        });
    };

    // Function to simulate a click on the file input element
    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <Card
            className={`bg-muted hover:border-muted-foreground/50 border-2 border-dashed hover:cursor-pointer ${className}`}
            {...props}
            onClick={handleButtonClick}
        >
            <CardContent
                className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="text-muted-foreground flex items-center justify-center" >
                    <span className="text-lg font-medium">Drag Files to Upload or</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto flex h-8 space-x-2 px-0 pl-1 text-lg"

                    >
                        Click Here
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        // accept={`.${fileExtension}`} // Set accepted file type
                        accept={`.*`} // Set accepted file type
                        onChange={handleFileInputChange}
                        className="hidden"
                        multiple
                    />
                </div>
                {fileInfo && <p className="text-muted-foreground">{fileInfo}</p>}
                {error && <span className="text-red-500">{error}</span>}
            </CardContent>
        </Card>
    );
}
