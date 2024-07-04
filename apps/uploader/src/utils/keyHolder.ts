import fs from 'node:fs';
import path from 'node:path';
import { subtle } from 'node:crypto';
import { ClearKeyPair, Key, SCP, Utils } from '@secretarium/connector';

const idKeyName = process.env.IKEY ?? 'i.key.pem';
const signKeyName = process.env.SKEY ?? 's.key.pem';
const roomKeyName = process.env.RKEY ?? 'r.key.pem';
const deploymentId = process.env.DID ?? process.env.NX_APP_KLAVE_CONTRACT ?? 'demo-room';
const secretariumEndpoint = process.env.NX_APP_SECRETARIUM_GATEWAYS?.split('#')?.[2] ?? 'wss://klave-prod.secretarium.org';

const klave = new SCP({
    logger: console
});

export class KeyHolder {
    static idKey?: Key;
    static signKey?: CryptoKey;
    static roomKey?: CryptoKey;
    static async loadServerIdentity() {
        const keysPath = path.resolve(path.join(__dirname, 'keys'));
        fs.mkdirSync(keysPath, { recursive: true});
        const idKeyPath = path.resolve(keysPath, idKeyName);
        if (!fs.existsSync(idKeyPath)) {
            console.info('Generating Klave identity key...');
            KeyHolder.idKey = await Key.createKey();
            await fs.writeFileSync(idKeyPath, JSON.stringify(await KeyHolder.idKey.exportKey()));
        } else {
            console.info('Loading Klave indentity key...');
            const idKeyContent = fs.readFileSync(idKeyPath);
            const idKey = JSON.parse(idKeyContent.toString()) as ClearKeyPair;
            KeyHolder.idKey = await Key.importKey(idKey);
        }

        klave.onError((e) => {
            console.error(e);
        });
        await klave.connect(secretariumEndpoint, KeyHolder.idKey);
        const signKeyPath = path.resolve(keysPath, signKeyName);
        if (!fs.existsSync(signKeyPath)) {
            // throw new Error('The signing key must be a file');
            const tx = klave.newTx(deploymentId, 'exportStorageServerPrivateKey', undefined, { format: 'raw' });
            const newSignKeyB64: string = await new Promise((resolve, reject) => {
                tx.onResult((result) => {
                    console.log('result', result)
                    if (result.success) return resolve(result.message);
                    reject();
                });
                tx.onError((error) => {
                    console.error('error',error)
                    reject();
                });
                tx.send();
            });
            const newSignKeyContent = Utils.fromBase64(newSignKeyB64);
             fs.writeFileSync(signKeyPath, newSignKeyContent);
        }
        const signKeyContent =  fs.readFileSync(signKeyPath);
        KeyHolder.signKey = await subtle.importKey(
            'raw',
            signKeyContent,
            {
                name: 'ECDH'
            },
            false,
            ['sign']
        );

        const roomKeyPath = path.resolve(keysPath, roomKeyName);
        if (!fs.existsSync(roomKeyPath)) {
            // throw new Error('The signing key must be a file');
            const tx = klave.newTx(deploymentId, 'getPublicKeys');
            const newRoomKeyPEM: string = await new Promise((resolve, reject) => {
                tx.onResult((result) => {
                    if (result.success) return resolve(result.backendPublicKey);
                    reject();
                });
                tx.onError(() => {
                    reject();
                });
                tx.send();
            });
             fs.writeFileSync(roomKeyPath, newRoomKeyPEM);
        }
        const roomKeyContent =  fs.readFileSync(roomKeyPath);
        KeyHolder.roomKey = await subtle.importKey(
            'spki',
            roomKeyContent,
            {
                name: 'ECDH'
            },
            false,
            ['verify']
        );
    }
}

export default KeyHolder;
