import { Ledger, JSON, Crypto, Context } from "@klave/sdk";
import { success, error } from "../klave/types"
import { encode as b64encode, decode as b64decode } from 'as-base64/assembly';
import { File } from "./file";
import { Keys } from "./keys";
import { FileInput } from "./inputs/types";
import { Notifier } from "@klave/sdk/assembly";
import { DataRoomContent, GetDataRoomContentOutput, GetFileUploadTokenOutput } from "./outputs/types";
import { Users } from "./users";
import { DataRoomRole, User } from "./user";

const DataRoomsTable = "DataRoomsTable";

@JSON
export class PublicKey {
    keyId: string;
    spkiPubKey: string;

    constructor(id: string, spki: string) {
        this.keyId = id;
        this.spkiPubKey = spki;
    }
}

@JSON
export class DataRoom {
    id: string;
    files: Array<string>;
    users: Array<string>;
    locked: boolean;

    constructor(id: string) {
        if (id.length > 0 ) {
            this.id = id;
        }
        else {
            this.id = b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(64)));
        }

        this.files = new Array<string>();
        this.users = new Array<string>();
        this.locked = false;
    }

    static load(dataRoomId: string) : DataRoom | null {
        let dataRoomTable = Ledger.getTable(DataRoomsTable).get(dataRoomId);
        if (dataRoomTable.length == 0) {
            // error(`DataRoom ${dataRoomId} does not exists. Create it first`);
            return null;
        }
        let dataRoom = JSON.parse<DataRoom>(dataRoomTable);
        // success(`DataRoom loaded successfully: '${dataRoom.id}'`);
        return dataRoom;
    }

    save(): void {
        let dataRoomTable = JSON.stringify<DataRoom>(this);
        Ledger.getTable(DataRoomsTable).set(this.id, dataRoomTable);
        // success(`DataRoom saved successfully: ${this.id}`);
    }

    delete(): void {
        for (let i = 0; i < this.files.length; i++) {
            let file = File.load(this.files[i]);
            if (file == null) {
                continue;
            }
            file.delete();
        }
        this.files = new Array<string>();
        this.users = new Array<string>();
        this.locked = false;
        Ledger.getTable(DataRoomsTable).unset(this.id);
        success(`Dataroom deleted successfully: ${this.id}`);
        this.id = "";
    }

    includes(fileName: string): string | null {
        for (let i=0; i<this.files.length; ++i) {
            if (this.files[i] == fileName)
            {
                return this.files[i];
            }
        }
        return null;
    }

    addFile(input: FileInput): boolean {
        if (!this.users.includes(Context.get('sender'))) {
            error(`You are not authorized to add files to this dataRoom.`);
            return false;
        }

        if (this.files.includes(input.name)) {
            error(`This file ${input.name} already exists in this dataRoom.`)
            return false;
        }
        this.files.push(input.name);

        let file = new File(input.name,
            input.digestB64,
            input.type,
            input.key,
            input.tokenB64);

        //Check signature is valid
        let keys = Keys.load();
        if (keys.storageServer_private_key == "") {
            error(`Cannot read storageServer identity.`);
        }

        let now : string = ""//Context.get("trusted_time");
        if (!file.verify_file_token(now, keys.storageServer_private_key)) {
            return false;
        }

        file.save();

        return true;
    }

    removeFile(input: FileInput): boolean {
        if (!this.users.includes(Context.get('sender'))) {
            error(`You are not authorized to remove files from this dataRoom.`);
            return false;
        }

        if (!this.files.includes(input.name)) {
            error(`This file ${input.name} does not exist in this dataRoom.`)
            return false;
        }
        let index = this.files.indexOf(input.name);
        this.files.splice(index, 1);

        let file = File.load(input.name);
        if (file == null) {
            return false;
        }
        file.delete();
        return true;
    }

    lock(): void {
        if (!this.users.includes(Context.get('sender'))) {
            error(`You are not authorized to lock this dataRoom.`);
            return;
        }
        this.locked = true;
    }

    getFileUploadToken(digestB64: string): void {
        if (!this.users.includes(Context.get('sender'))) {
            error(`You are not authorized to create a file token for this dataRoom.`);
            return;
        }

        let file = new File("", digestB64, "", "", "");

        let keys = Keys.load();
        if (keys.klaveServer_private_key == "") {
            error(`Cannot read klaveServer identity.`);
            return;
        }

        let now : string = ""//Context.get("trusted_time");
        let token = file.generate_file_token(now, keys.klaveServer_private_key);

        Notifier.sendJson<GetFileUploadTokenOutput>({
            requestId: Context.get('request_id'),
            result: {
                tokenB64: b64encode(token)
            }
        });
    }

    getContent(): void {
        if (!this.users.includes(Context.get('sender'))) {
            error(`You are not authorized to retrieve the content of this dataRoom.`);
            return;
        }

        let content = new DataRoomContent;
        content.locked = this.locked;
        for (let i = 0; i < this.files.length; i++) {
            let file = File.load(this.files[i]);
            if (file == null) {
                continue;
            }
            content.files.push(file);
        }

        Notifier.sendJson<GetDataRoomContentOutput>({
            requestId: Context.get('request_id'),
            result: content
        });
    }

    addUser(userId: string, role: string): boolean {
        if (!this.users.includes(userId)) {
            // This is a user request to become an admin
            let user = User.load(userId);
            if (!user)
            {
                error("User not found");
                return false;
            }
            user.updateRole(new DataRoomRole(this.id, role));
            user.save();

            this.users.push(userId);
            return true;
        }
        return false;
    }
}