import { JSON } from "@klave/sdk";

@JSON
export class GetFileUploadToken {
    dataRoomId: string;
    digestB64: string;
}

@JSON
export class FileInput {
    name: string;
    digestB64: string;
    type: string;
    key: string;
    tokenB64: string;
}

@JSON
export class UpdateDataRoomInput {
    dataRoomId: string;
    operation: string;      //addFile / removeFile / lock
    file: FileInput;
}

@JSON
export class DataRoomIDInput {
    dataRoomId: string;
}

@JSON
export class AddUserToDataRoomInput {
    dataRoomId: string;
    userId: string;
}

@JSON
export class SetIdentitiesInput {
    resetKlaveServer: boolean;
    resetStorageServer: boolean;
}

@JSON
export class ExportStorageServerPrivateKeyInput {
    format: string;
}

@JSON
export class UserRequestInput {
    dataRoomId: string;
    role: string;
}

@JSON
export class ApproveUserRequestInput {
    userRequestId: string;
}