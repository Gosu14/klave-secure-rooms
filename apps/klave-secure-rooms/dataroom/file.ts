import { Ledger, Crypto, JSON } from '@klave/sdk'
import { success, error } from "../klave/types"
import { encode as b64encode, decode as b64decode } from 'as-base64/assembly';

const FilesTable = "FilesTable";

@JSON
export class File {
    id: string;
    name: string;
    digestB64: string;
    type: string;   //image/jpg, MIME type
    key: string;    //
    tokenB64: string;

    constructor(name: string, digestB64: string, type: string, key: string, tokenB64: string) {
        this.id = b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(64)));
        this.name = name;
        this.digestB64 = digestB64;
        this.type = type;
        this.key = key;
        this.tokenB64 = tokenB64;
    }

    static load(fileName: string) : File | null {
        let fileTable = Ledger.getTable(FilesTable).get(fileName);
        if (fileTable.length == 0) {
            // error("File does not exists. Create it first");
            return null;
        }
        let file = JSON.parse<File>(fileTable);
        // success(`File loaded successfully: '${file.id}'`);
        return file;
    }

    save(): void {
        let fileTable = JSON.stringify<File>(this);
        Ledger.getTable(FilesTable).set(this.name, fileTable);
        success(`File saved successfully: ${this.name}`);
    }

    delete(): void {
        Ledger.getTable(FilesTable).unset(this.name);
        success(`File deleted successfully: ${this.name}`);
    }

    verify_file_token(now: string, storageServer_private_key: string) : boolean {
        let token = b64decode(this.tokenB64);
        if (token.length != (40 + 64)) {
            error("file upload token size is invalid");
            return false;
        }

        let token_digest = token.subarray(0, 32);
        if (this.digestB64 != b64encode(token_digest)) {
            error("file upload token refers to the wrong file: " + this.digestB64 + " != " + b64encode(token_digest));
			return false;
        }

        let token_time = token.subarray(32, 40);
        // Check the token has not expired
        // if (token_time.toString() > now) {
        //     error("file upload token has expired:" + token_time.toString() + " > " + now);
		// 	return false;
        // }

        let token_body = token.subarray(0, 40);
        let token_signature = token.subarray(40, 40+64);

        let storageServer_pkey = Crypto.ECDSA.getKey(storageServer_private_key);
        if (!storageServer_pkey) {
            error("Issue retrieving the key" + storageServer_private_key);
            return false;
        }
        let verified = storageServer_pkey.verify(b64encode(token_body), Crypto.Utils.convertToU8Array(token_signature));
        if(!verified) {
			error("file upload token signature is invalid: " + b64encode(token_signature) + ", " + b64encode(token_body));
			return false;
        }
        return true;
    }

    generate_file_token(now: string, klaveServer_private_key: string): Uint8Array {
        let digest = b64decode(this.digestB64);

        let token_body = new Uint8Array(40);
        token_body.set(digest, 0);
        token_body.set(new Uint8Array(8), digest.byteLength);

        let klaveServer_signing_key = Crypto.ECDSA.getKey(klaveServer_private_key);
        if (!klaveServer_signing_key) {
            error("Issue retrieving the key" + klaveServer_private_key);
            return new Uint8Array(0);
        }

        let token_signature = klaveServer_signing_key.sign(b64encode(token_body));
        let token = new Uint8Array(40 + 64);
        token.set(token_body, 0);
        token.set(Crypto.Utils.convertToUint8Array(token_signature), 40);
        return token;
    }
}