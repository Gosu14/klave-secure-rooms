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

export type ListDataRoomsResult =
    | {
          success: true;
          dataRooms: string[];
      }
    | {
          success: false;
          exception: string;
      };