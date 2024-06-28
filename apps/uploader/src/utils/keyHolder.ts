import fs from 'node:fs/promises';
import path from 'node:path';
import { subtle } from 'node:crypto';
import { ClearKeyPair, Key, SCP, Utils } from '@secretarium/connector';

const idKeyName = process.env.IKEY ?? 'i.key.pem';
const signKeyName = process.env.SKEY ?? 's.key.pem';
const roomKeyName = process.env.RKEY ?? 'r.key.pem';
const deploymentId = process.env.DID ?? 'demo-room';

const klave = new SCP({
    logger: console
});

export class KeyHolder {
    static idKey?: Key;
    static signKey?: CryptoKey;
    static roomKey?: CryptoKey;
    static async loadServerIdentity() {
        const keysPath = path.resolve(path.join(__dirname, 'keys'));
        await fs.mkdir(keysPath, { recursive: true });

        const idKeyPath = path.resolve(keysPath, idKeyName);
        const idKeyStat = await fs.stat(idKeyPath).catch(() => {
            console.warn('Klave identity is missing');
        });
        if (!idKeyStat?.isFile) {
            console.info('Generating Klave identity key...');
            KeyHolder.idKey = await Key.createKey();
            await fs.writeFile(idKeyPath, JSON.stringify(await KeyHolder.idKey.exportKey()));
        } else {
            console.info('Loading Klave indentity key...');
            const idKeyContent = await fs.readFile(idKeyPath);
            const idKey = JSON.parse(idKeyContent.toString()) as ClearKeyPair;
            KeyHolder.idKey = await Key.importKey(idKey);
        }

        klave.onError((e) => {
            console.error(e);
        });
        await klave.connect('wss://klave.secretarium.org', KeyHolder.idKey);

        const signKeyPath = path.resolve(keysPath, signKeyName);
        const signKeyStat = await fs.stat(signKeyPath).catch(() => {
            return;
        });
        if (!signKeyStat?.isFile) {
            // throw new Error('The signing key must be a file');
            const tx = klave.newTx(deploymentId, 'exportStorageServerPrivateKey', undefined, { format: 'raw' });
            const newSignKeyB64: string = await new Promise((resolve, reject) => {
                tx.onResult((result) => {
                    if (result.success) return resolve(result.message);
                    reject();
                });
                tx.onError(() => {
                    reject();
                });
            });
            const newSignKeyContent = Utils.fromBase64(newSignKeyB64);
            await fs.writeFile(signKeyPath, newSignKeyContent);
        }
        const signKeyContent = await fs.readFile(signKeyPath);
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
        const roomKeyStat = await fs.stat(roomKeyPath).catch(() => {
            return;
        });
        if (!roomKeyStat?.isFile) {
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
            });
            await fs.writeFile(roomKeyPath, newRoomKeyPEM);
        }
        const roomKeyContent = await fs.readFile(roomKeyPath);
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
