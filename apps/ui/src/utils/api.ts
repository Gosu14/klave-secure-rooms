import secretariumHandler from './secretarium-handler';
import {
    TransactionResult,
    TokenIdentityResult,
    FileUploadTokenResult,
    ListDataRoomsResult,
    DataRoomContentResult
} from './types';

export const klaveContract = import.meta.env.VITE_APP_KLAVE_CONTRACT;

export const waitForConnection = () =>
    new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected();
            if (isConnected) resolve();
            else setTimeout(loopCondition, 1000);
        };
        loopCondition();
    });

export const setTokenIdentity = async (token: string): Promise<TransactionResult> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveContract,
                'setTokenIdentity',
                { token },
                `setTokenIdentity-${Math.random()}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const setWebServerIdentity = async (spkiPublicKey: string): Promise<TransactionResult> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveContract,
                'setWebServerIdentity',
                { spkiPublicKey },
                `setWebServerIdentity-${Math.random()}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const createDataRoom = async (dataRoomId: string): Promise<TransactionResult> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveContract,
                'createDataRoom',
                { dataRoomId },
                `createDataRoom-${Math.random()}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const updateDataRoom = async (dataRoomId: string): Promise<TransactionResult> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveContract,
                'updateDataRoom',
                { dataRoomId },
                `updateDataRoom-${Math.random()}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const getTokenIdentity = async (): Promise<TokenIdentityResult> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(klaveContract, 'getTokenIdentity', {}, `getTokenIdentity-${Math.random()}`)
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const getFileUploadToken = async (): Promise<FileUploadTokenResult> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(klaveContract, 'getFileUploadToken', {}, `getFileUploadToken-${Math.random()}`)
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const listDataRooms = async (): Promise<ListDataRoomsResult> =>
    waitForConnection()
        .then(() => secretariumHandler.request(klaveContract, 'listDataRooms', {}, `listDataRooms-${Math.random()}`))
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const getDataRoomContent = async (dataRoomId: string): Promise<DataRoomContentResult> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveContract,
                'getDataRoomContent',
                { dataRoomId },
                `getDataRoomContent-${Math.random()}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
