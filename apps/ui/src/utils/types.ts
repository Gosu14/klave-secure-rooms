import { EncryptedKeyPair } from '@secretarium/connector';

export type KeyPair = EncryptedKeyPair & {
    id: string;
    name: string;
};

export type TransactionResult =
    | {
          success: true;
          message: string;
      }
    | {
          success: false;
          exception: string;
      };

export type TokenIdentityResult =
    | {
          success: true;
          identity: string;
      }
    | {
          success: false;
          exception: string;
      };

export type FileUploadTokenResult =
    | {
          success: true;
          token: string;
      }
    | {
          success: false;
          exception: string;
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
    }
    message?: string;
}

export type DataRoomFile = {
    digestB64: string;
    name: string;
    id: string;
    key: string;
    tokenB64: string;
    type: string;
}
