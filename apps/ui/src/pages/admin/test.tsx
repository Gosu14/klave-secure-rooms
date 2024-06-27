import {
    getTokenIdentity,
    importPublicKey,
    setWebServerTokenIdentity,
    getFileUploadToken,
    verify,
    sign,
    updateDataRoom,
    exportWebServerIdentity
} from '../../utils/api';
import { arrayBufferToBase64, base64ToArrayBuffer, subtleHash } from '../../utils/helpers';

// const privateKey = `
// -----BEGIN EC PRIVATE KEY-----
// MHcCAQEEIBD4a3SjphAdFv2iyzuc7QH8B0R0B96nVqnvnX9mXvYloAoGCCqGSM49
// AwEHoUQDQgAEXbgaa/qogASdgc6Fer3yIA3YNeS0FLulPQm0KoiHwvbGFQcZgjKd
// fNTD+rJ06JEpzPQLts1/Ynfk/Ss2Yf6GCA==
// -----END EC PRIVATE KEY-----
// `;

const testTxt = `
Hello there!
`;

const createFileDigest = async () => {
    const digest = await subtleHash(testTxt);
    const digestB64 = arrayBufferToBase64(digest);
    return digestB64;
};

const getUploadToken = async (dataRoomId: string, digestB64: string, backendPublicKey: string) => {
    //WebServer asks signature from Backend
    const getFileUploadTokenInput = {
        dataRoomId: dataRoomId,
        digestB64: digestB64
    };

    const result = await getFileUploadToken(getFileUploadTokenInput);
    console.log('getFileUploadToken', result);
    const token = await base64ToArrayBuffer(result.result.tokenB64);
    const tokenBody = new Uint8Array(token.byteLength - 64);
    tokenBody.set(new Uint8Array(token, 0, token.byteLength - 64), 0);

    const tokenBodyB64 = await arrayBufferToBase64(tokenBody);

    const tokenSignature = new Uint8Array(64);
    tokenSignature.set(new Uint8Array(token, token.byteLength - 64, 64), 0);

    const tokenSignatureB64 = await arrayBufferToBase64(tokenSignature);

    //WebServer verifies signature
    const verified = await verify(backendPublicKey, tokenBodyB64, tokenSignatureB64);
    console.assert(verified, 'Error verifying signature');
    return true;
};

const updateDR = async (dataRoomId: string, digestB64: string, webSvrPrivKey: any) => {
    //Token is a b64 concatenation between the file digest, the time and the signature of the couple {file digest, time}
    const time = new Date().getTime();
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setBigInt64(0, BigInt(time), true);

    const digest = base64ToArrayBuffer(digestB64);
    const tokenSign = new Uint8Array(digest.byteLength + timeBuffer.byteLength);

    tokenSign.set(new Uint8Array(digest), 0);
    tokenSign.set(new Uint8Array(timeBuffer), digest.byteLength);
    const tokenSignB64 = arrayBufferToBase64(tokenSign);
    const signatureB64 = await sign(webSvrPrivKey.message, tokenSignB64);
    const signature = base64ToArrayBuffer(signatureB64.message);

    const token = new Uint8Array(digest.byteLength + timeBuffer.byteLength + signature.byteLength);
    token.set(new Uint8Array(digest), 0);
    token.set(new Uint8Array(timeBuffer), digest.byteLength);
    token.set(new Uint8Array(signature), digest.byteLength + timeBuffer.byteLength);

    const tokenB64 = arrayBufferToBase64(token);

    const updateDRInput = {
        dataRoomId: dataRoomId,
        operation: 'addFile',
        file: {
            name: 'hello_there.txt',
            digestB64: digestB64,
            type: '',
            key: '',
            tokenB64: tokenB64
        }
    };

    const result = await updateDataRoom(updateDRInput);
    console.log('result', result);
};

export const loader = async () => {
    // export web servers private key
    const webServerPrivateKey = await exportWebServerIdentity('pkcs8');
    console.log('webServerPrivateKey', webServerPrivateKey);

    // set web server identity
    const webServerKey = await setWebServerTokenIdentity(webServerPrivateKey.message);
    console.log('webServerKey', webServerKey);

    // get token identity
    const tokenIdentity = await getTokenIdentity();
    console.log('tokenIdentity', tokenIdentity);
    const backendKeyName = await importPublicKey(tokenIdentity.result.backendPublicKey);
    console.log('backendKeyName', backendKeyName);

    // get file digest
    const digest = await createFileDigest();
    console.log('digest', digest);

    // ask the backend for a token
    const token = await getUploadToken(
        '2qnXe81n4XVI60O9cKG7KjNN3O4m/x7zckI/GkU3lzjtc1YotEgKoTVy7707IEmJjkwP7fvkDbBarFejbx9fmQ==',
        digest,
        backendKeyName.message
    );
    console.log('token', token);

    // update the dataRoom with the new file
    const udr = await updateDR(
        '2qnXe81n4XVI60O9cKG7KjNN3O4m/x7zckI/GkU3lzjtc1YotEgKoTVy7707IEmJjkwP7fvkDbBarFejbx9fmQ==',
        digest,
        webServerKey
    );
    console.assert(udr, 'Error updating dataRoom with new file');

    return null;
};

export const Test = () => {
    return <div>Test</div>;
};
