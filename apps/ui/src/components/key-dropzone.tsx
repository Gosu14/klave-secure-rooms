import { useCallback } from 'react';
import { useDropzone, DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';
import { Card, CardContent } from '@klave-secure-rooms/ui-kit/ui';
import { KeyPair } from '../utils/types';

type DropzoneProps = {
    onFileUpload: (data: KeyPair | null) => void;
};

export const KeyDropzone: React.FC<DropzoneProps> = ({ onFileUpload }) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('File reading was aborted');
            reader.onerror = () => console.log('File reading failed');
            reader.onload = (event) => {
                if (event.target?.result) {
                    const data = JSON.parse(event.target.result as string); // Assuming JSON data
                    onFileUpload(data);
                }
            };

            // Read file contents
            acceptedFiles.forEach((file) => reader.readAsText(file));
        },
        [onFileUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.secretarium']
        }
    });

    return (
        <Card className="bg-muted hover:border-muted-foreground/50 w-full border-2 border-dashed hover:cursor-pointer">
            <CardContent
                className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
                {...(getRootProps() as DropzoneRootProps)}
            >
                <div className="text-muted-foreground flex items-center justify-center">
                    <input {...(getInputProps() as DropzoneInputProps)} />
                    <p>
                        {isDragActive
                            ? 'Drop the key here...'
                            : "Drag 'n' drop some Secretarium keys here, or click to select key"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
