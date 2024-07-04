import { Ledger, JSON, Context } from "@klave/sdk";
import { success, error } from "../klave/types";
import { DataRoomRole, User } from "./user";
import { ListOutput } from "./outputs/types";
import { Notifier } from "@klave/sdk/assembly";

const UsersTable = "UsersTable";

/**
 * An Users is associated with a list of users and holds users.
 */
@JSON
export class Users {
    users: Array<string>;

    constructor() {
        this.users = new Array<string>();
    }

    /**
     * load the users from the ledger.
     * @returns true if the users was loaded successfully, false otherwise.
     */
    static load(): Users {
        let usersTable = Ledger.getTable(UsersTable).get("ALL");
        if (usersTable.length == 0) {
            // success(`New Users Table created successfully`);
            return new Users;
        }
        let wlt = JSON.parse<Users>(usersTable);
        // success(`Users loaded successfully: ${usersTable}`);
        return wlt;
    }

    /**
     * save the users to the ledger.
     */
    save(): void {
        let usersTable = JSON.stringify<Users>(this);
        Ledger.getTable(UsersTable).set("ALL", usersTable);
        // success(`Users saved successfully: ${usersTable}`);
    }

    /**
     * Add a user to the list of users.
     * @param userId The id of the user to add.
     */
    addUser(userId: string, dataRoomId: string, role: string): boolean {
        let existingUser = User.load(userId);
        if (existingUser) {
            error(`User already exists: ${userId}`);
            return false;
        }
        let user = new User(userId, new DataRoomRole(dataRoomId, role));
        user.save();
        this.users.push(user.id);

        // success(`User added successfully: ${user.id} `);
        return true;
    }

    /**
     * Remove a user from the list of users.
     * @param userId The id of the user to remove.
     */
    removeUser(userId: string): boolean {
        let user = User.load(userId);
        if (!user) {
            error("User not found: " + userId);
            return false;
        }
        user.delete();

        let index = this.users.indexOf(user.id);
        this.users.splice(index, 1);
        success("User removed successfully: " + userId);
        return true;
    }

    /**
     * list all the users in the users.
     * @returns
     */
    list(): void {
        if (this.users.length == 0) {
            success(`No user found in the list of users`);
        }

        Notifier.sendJson<ListOutput>({
            requestId: Context.get('request_id'),
            result: this.users
        });
    }


    delete(): void {
        for (let i = 0; i < this.users.length; i++) {
            let user = User.load(this.users[i]);
            if (user) {
                user.delete();
            }
        }
        this.users = new Array<string>();
        this.save();
    }
}