import { Helmet } from 'react-helmet-async';
import { useLocalStorage } from 'usehooks-ts';
import { LOC_KEY } from '../../utils/constants';
import { Button } from '@klave-secure-rooms/ui-kit/ui';
import { Link } from 'react-router-dom';
import { KeyRound, Download, UserRoundPlus, Crown } from 'lucide-react';
import { KeyPair } from '../../utils/types';
import { KeyDropzone } from '../../components/key-dropzone';

export const Auth = () => {
    const [keyPairs, setKeyPairs] = useLocalStorage<KeyPair[]>(LOC_KEY, []);

    const downloadKey = (currentKeyPair: KeyPair) => {
        const blob = new Blob([JSON.stringify(currentKeyPair)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentKeyPair.name}.secretarium`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (key: KeyPair | null) => {
        // Perform upload logic here (e.g., send files to server)
        if (key) {
            setKeyPairs((prevKeyPairs) => [...prevKeyPairs, key]);
        }
    };

    return (
        <>
            <Helmet>
                <title>Welcome | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-2xl font-semibold">Secure Data Rooms</h1>
                {keyPairs.length > 0 ? (
                    <div className="flex w-full flex-col items-center gap-4">
                        <p className="text-center italic">Select a key to sign in.</p>
                        <div className="flex w-full flex-col gap-2">
                            {keyPairs.map((keyPair, id) => (
                                <div className="flex gap-2" key={id}>
                                    <Link to={`/auth/${id + 1}`} state={{ keyPair }} className="w-full">
                                        <Button variant="outline" className="w-full">
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            {keyPair.name}
                                        </Button>
                                    </Link>
                                    <Button variant="outline" size="icon" onClick={() => downloadKey(keyPair)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <p className="text-center italic">There are currently no accounts setup on this device.</p>
                    </div>
                )}
                <div className="w-full">
                    <KeyDropzone onFileUpload={handleFileUpload} />
                </div>
                <div className="w-full">
                    <Link to="/auth/register">
                        <Button className="w-full">
                            <UserRoundPlus className="mr-2 h-4 w-4" />
                            Register new account
                        </Button>
                    </Link>
                </div>
                <div className="w-full">
                    <Link to="/auth/create-super-admin">
                        <Button className="w-full bg-blue-500">
                            <Crown className="mr-2 h-4 w-4" />
                            Set up super admin account
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
};
