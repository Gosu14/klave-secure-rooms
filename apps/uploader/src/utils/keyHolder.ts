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
    // logger: console
});

export class KeyHolder {
    static idKey?: Key;
    static signKey?: CryptoKey;
    static roomKey?: CryptoKey;
    static async loadServerIdentity() {
        const keysPath = path.resolve(path.join(__dirname, 'keys'));
        fs.mkdirSync(keysPath, { recursive: true });
        const idKeyPath = path.resolve(keysPath, idKeyName);
        if (!fs.existsSync(idKeyPath)) {
            console.info('Generating Klave identity...');
            KeyHolder.idKey = await Key.createKey();
            await fs.writeFileSync(idKeyPath, JSON.stringify(await KeyHolder.idKey.exportKey()));
        } else {
            console.info('Loading Klave indentity...');
            const idKeyContent = fs.readFileSync(idKeyPath);
            const idKey = JSON.parse(idKeyContent.toString()) as ClearKeyPair;
            KeyHolder.idKey = await Key.importKey(idKey);
        }

        klave.onError((e) => {
            console.error(e);
        });
        await klave.connect(secretariumEndpoint, KeyHolder.idKey);

        await new Promise<void>((gresolve, greject) => {
            let passCount = 0;
            const blockUntilAdmin = async () => {
                if (passCount === 1) {
                    console.info('Waiting to be granted rights...');
                }
                passCount++;
                const tx = klave.newTx(deploymentId, 'getUserContent', undefined, {});
                const userContent: any = await new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        if (result.result) return resolve(result.result);
                        reject();
                    });
                    tx.onError((error) => {
                        console.error('User info could not be fetched', error)
                        reject();
                    });
                    tx.send();
                });
                if (Array.isArray(userContent.roles)) {
                    const room = userContent.roles[0];
                    if (room) {
                        if (room.role === 'admin') {
                            return gresolve()
                        }
                        else
                            return setTimeout(blockUntilAdmin, 5000);
                    } else {
                        return setTimeout(blockUntilAdmin, 5000);
                    }
                }
            }
            blockUntilAdmin().catch(greject);
        });

        const signKeyPath = path.resolve(keysPath, signKeyName);
        if (!fs.existsSync(signKeyPath)) {
            // throw new Error('The signing key must be a file');
            console.info('Obtaining the signing key...');
            const txr = klave.newTx(deploymentId, 'resetIdentities', undefined, { resetKlaveServer: true, resetStorageServer: true });
            await new Promise((resolve, reject) => {
                txr.onResult((result) => {
                    if (result.success) return resolve(result.message);
                    reject();
                });
                txr.onError((error) => {
                    console.error('Indentity reset failed:', error)
                    reject();
                });
                txr.send();
            }); 
            const txe = klave.newTx(deploymentId, 'exportStorageServerPrivateKey', undefined, { format: 'pkcs8' });
            const newSignKeyB64: string = await new Promise((resolve, reject) => {
                txe.onResult((result) => {
                    if (result.success) return resolve(result.message);
                    reject();
                });
                txe.onError((error) => {
                    console.error('Key export failed:', error)
                    reject();
                });
                txe.send();
            });
            const newSignKeyContent = Utils.fromBase64(newSignKeyB64);
            fs.writeFileSync(signKeyPath, newSignKeyContent);
        }
        const signKeyContent = fs.readFileSync(signKeyPath);
        KeyHolder.signKey = await subtle.importKey(
            'pkcs8',
            signKeyContent,
            {
                namedCurve: 'P-256',
                name: 'ECDSA'
            },
            false,
            ['sign']
        );

        const roomKeyPath = path.resolve(keysPath, roomKeyName);
        if (!fs.existsSync(roomKeyPath)) {
            console.info('Obtaining the room key...');
            // throw new Error('The signing key must be a file');
            const tx = klave.newTx(deploymentId, 'getPublicKeys', undefined, {});
            const newRoomKeyPEM: string = await new Promise((resolve, reject) => {
                tx.onResult((result) => {
                    if (result.result) return resolve(result.result.klaveServerPublicKey);
                    reject();
                });
                tx.onError((error) => {
                    console.error('newRoomKeyPEM error', error)
                    reject();
                });
                tx.send();
            });

            const newRoomKeyB64 = Array.from(newRoomKeyPEM.toString().matchAll(/KEY-----\s*([\S]*?)\s*-----/mg))[0][1];
            const newRoomKeyContent = Utils.fromBase64(newRoomKeyB64);
            fs.writeFileSync(roomKeyPath, newRoomKeyContent);
        }
        const roomKeyContent = fs.readFileSync(roomKeyPath);
        KeyHolder.roomKey = await subtle.importKey(
            'spki',
            roomKeyContent, 
            {
                namedCurve: 'P-256',
                name: 'ECDSA'
            },
            false,
            ['verify']
        );

        console.log('Keys loaded successfully');
    }
}

export default KeyHolder;
