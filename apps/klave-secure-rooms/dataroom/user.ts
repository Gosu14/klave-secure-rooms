import { Ledger, JSON, Crypto } from "@klave/sdk";
import { success, error } from "../klave/types"
import { encode as b64encode } from 'as-base64/assembly';
import { Context, Notifier } from "@klave/sdk/assembly";
import { UserOutput } from "./outputs/types";

const UsersTable = "UsersTable";

@JSON
export class DataRoomRole {
    dataRoomId: string;
    role: string;

    constructor(dataRoomId: string, role: string) {
        this.dataRoomId = dataRoomId;
        this.role = role;
    }
}

/**
 * Roles of the user in the wallet
 * - admin: can manage the wallet and its users
 * - internal user: can sign and verify transactions
 * - external user: can only sign transactions
 **/
@JSON
export class User {
    id: string;
    roles: Array<DataRoomRole>;

    constructor(id: string , role: DataRoomRole) {
        if (id.length > 0) {
            this.id = id;
        }
        else {
            this.id = b64encode(Crypto.getRandomValues(64)!);
        }
        this.roles = new Array<DataRoomRole>();
        this.roles.push(role);
    }

    static load(id: string) : User | null {
        let userTable = Ledger.getTable(UsersTable).get(id);
        if (userTable.length == 0) {
            // error(`User ${id} does not exist. Create it first`);
            return null;
        }
        let user = JSON.parse<User>(userTable);
        // success(`User profile loaded successfully: '${user.id}'`);
        return user;
    }

    save(): void {
        let userTable = JSON.stringify<User>(this);
        Ledger.getTable(UsersTable).set(this.id, userTable);
        // success(`User saved successfully: '${this.id}'`);
    }

    delete(): void {
        this.roles = new Array<DataRoomRole>();
        Ledger.getTable(UsersTable).unset(this.id);
        success(`User deleted successfully: ${this.id}`);
        this.id = "";
    }

    isAdmin(dataRoomId: string): boolean {
        for (let i = 0; i < this.roles.length; ++i)
        {
            if (this.roles[i].dataRoomId == dataRoomId) {
                return this.roles[i].role == 'admin';
            }
        }
        return false;
    }

    getContent(): void {
        Notifier.sendJson<UserOutput>({
            requestId: Context.get('request_id'),
            result: this
        });
    }

    updateRole(newRole: DataRoomRole): void {
        for (let i = 0; i < this.roles.length; ++i)
        {
            if (this.roles[i].dataRoomId == newRole.dataRoomId) {
                this.roles[i].role = newRole.role;
                return;
            }
        }
        this.roles.push(newRole);
        return;
    }
}