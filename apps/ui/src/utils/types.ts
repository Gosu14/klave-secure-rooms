import { EncryptedKeyPair } from '@secretarium/connector';

export type KeyPair = EncryptedKeyPair & {
    id: string;
    name: string;
};

export type ActionData = {
    error: boolean;
    message?: string;
};

export type TransactionResult = {
    success: boolean;
    message: string;
};

export type TokenIdentityResult = {
    requestId: string;
    result: {
        backendPublicKey: string;
        webserverPublicKey: string;
    };
    message?: string;
};

export type ListUserRequestsResult = {
    requestId: string;
    result: string[];
    message?: string;
};

export type ListDataRoomsResult = {
    requestId: string;
    result: string[];
    message?: string;
};

export type DataRoomContentResult = {
    requestId: string;
    result: {
        locked: boolean;
        files: DataRoomFile[];
    };
    message?: string;
};

export type DataRoomFile = {
    digestB64: string;
    name: string;
    id: string;
    key: string;
    tokenB64: string;
    type: string;
};

export type GetFileUploadTokenResult = {
    requestId: string;
    result: {
        tokenB64: string;
    };
};

export type DataRoomRole = {
    dataRoomId: string;
    role: string;
};

export type GetUserContentResult = {
    requestId: string;
    result: {
        id: string;
        roles: DataRoomRole[];
    };
    message?: string;
};

export type GetFileUploadTokenInput = {
    dataRoomId: string;
    digestB64: string;
};

export type UpdateDataRoomInput = {
    dataRoomId: string;
    operation: string;
    file: {
        name: string;
        digestB64: string;
        type: string;
        key: string;
        tokenB64: string;
    };
};

export type UserRequestInput = {
    dataRoomId: string;
    role: string;
};

export type ApproveUserRequestInput = {
    userRequestId: string;
};

export type SetIdentitiesInput = {
    resetKlaveServer: boolean;
    resetStorageServer: boolean;
};

export type ExportStorageServerPrivateKeyInput = {
    format: string;
};
