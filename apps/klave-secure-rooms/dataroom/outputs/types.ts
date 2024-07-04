import { JSON } from "@klave/sdk";
import { File } from "../file";
import { User } from "../user";

@JSON
export class KeysList {
    klaveServerPublicKey: string;
    storageServerPublicKey: string;

    constructor(klaveServer:string, storageServer: string) {
        this.klaveServerPublicKey = klaveServer;
        this.storageServerPublicKey = storageServer;
    }
}

@JSON
export class TokenIdentityOutput {
    requestId: string;
    result: KeysList;
}

@JSON
export class FileUploadToken {
    tokenB64: string;
}

@JSON
export class GetFileUploadTokenOutput {
    requestId: string;
    result: FileUploadToken;
}

@JSON
export class DataRoomContent {
    locked: boolean;
    files: Array<File>;

    constructor() {
        this.locked = false;
        this.files = new Array<File>();
    }
}

@JSON
export class GetDataRoomContentOutput {
    requestId: string;
    result: DataRoomContent;
}

@JSON
export class ListOutput {
    requestId: string;
    result: Array<string>;
}


@JSON
export class UserOutput {
    requestId: string;
    result: User;
}