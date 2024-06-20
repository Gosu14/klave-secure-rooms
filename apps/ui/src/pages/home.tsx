import { Helmet } from 'react-helmet-async';

export const Home = () => {
    return (
        <>
            <Helmet>
                <title>Home | Secure Data Rooms</title>
            </Helmet>
            <div className="flex flex-col p-4">
                <h1 className="text-2xl font-semibold">Home</h1>
                <p className="pt-8 italic">Welcome to Secure Data Rooms App!</p>
            </div>
        </>
    );
};

// encrypt the file
// send to enclave and sign the content, verify it's indeed the same file
