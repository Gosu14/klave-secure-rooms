import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { exportWebServerIdentity, isConnected, resetIdentities } from '../../utils/api';
import { Button } from '@klave-secure-rooms/ui-kit/ui';
import { redirect } from 'react-router-dom';

export const loader = async () => {
    const isConnectedState = isConnected();

    if (!isConnectedState) {
        return redirect('/auth');
    }

    const res = await exportWebServerIdentity('raw');

    console.log(res);

    return null;
};

export const Keys = () => {
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleResetIdentities = async () => {
        const result = await resetIdentities({ resetBackend: true, resetWebServer: true });
        console.log(result);

        if (result.success) {
            setSuccessMsg(result.message);
            setError(null);
        } else {
            setError(result.message);
            setSuccessMsg(null);
        }
    };

    return (
        <>
            <Helmet>
                <title>Keys | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col gap-4 px-12 py-4">
                <h2 className="text-lg font-semibold">Keys</h2>
                <div className="flex flex-col gap-2">
                    <Button className="w-48" onClick={handleResetIdentities}>
                        Reset Identities
                    </Button>
                </div>
                {error && <p className="overflow-clip text-red-500">{error}</p>}
                {successMsg && <p className="overflow-clip text-green-500">{successMsg}</p>}
            </div>
        </>
    );
};
