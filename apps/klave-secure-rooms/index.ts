import { Context } from "@klave/sdk/assembly";
import { DataRoom } from "./dataroom/dataroom";
import { DataRooms } from "./dataroom/datarooms";
import { DataRoomIDInput, GetFileUploadToken, SetIdentitiesInput, UpdateDataRoomInput, ExportStorageServerPrivateKeyInput, UserRequestInput, ApproveUserRequestInput } from "./dataroom/inputs/types";
import { Keys } from "./dataroom/keys";
import { DataRoomRole, User } from "./dataroom/user";
import { Users } from "./dataroom/users";
import { success, error } from "./klave/types";
import { UserRequests } from "./dataroom/userRequests";
import { UserRequest } from "./dataroom/userRequest";

/**
 * @transaction
 */
export function createSuperAdmin(unused: string): void {
    let users = Users.load();
    if (users.users.length > 0) {
        error("Super admin already exists");
        return;
    }
    if (users.addUser(Context.get('sender'), "super", "admin")) {
        users.save();
        success(`Super admin set-up successfully.`);
    }
}

/**
 * @transaction
 */
export function createUserRequest(input: UserRequestInput): void {
    let users = Users.load();
    if (users.addUser(Context.get('sender'), input.dataRoomId, "pending")) {
        users.save();
    }

    let userRequests = UserRequests.load();
    if (userRequests.addUserRequest(input.dataRoomId, input.role)) {
        userRequests.save();
    }
}

/**
 * @query
 */
export function listUserRequests(unused: string): void {
    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }
    if (!user.isAdmin("super"))
    {
        error("You are not allowed to see user requests");
        return;
    }

    let userRequests = UserRequests.load();
    userRequests.list();
}

/**
 * @transaction
 */
export function approveUserRequest(input: ApproveUserRequestInput): void {
    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }
    if (!user.isAdmin("super"))
    {
        error("You are not allowed to see user requests");
        return;
    }

    let userRequest = UserRequest.load(input.userRequestId);
    if (!userRequest)
    {
        error("UserRequest not found");
        return;
    }

    if (userRequest.dataRoomId == "super" && userRequest.role == "admin") {
        // This is a user request to become an admin
        let user = User.load(userRequest.userId);
        if (!user)
        {
            error("User not found");
            return;
        }

        user.updateRole(new DataRoomRole(userRequest.dataRoomId, userRequest.role));
        user.save();
        success(`Approved SuperAdmin request ${userRequest.id} for user ${userRequest.userId} with ${userRequest.dataRoomId}, ${userRequest.role}.`);
    }
    else {
        let dataRoom = DataRoom.load(userRequest.dataRoomId);
        if (!dataRoom)
        {
            error("DataRoom not found");
            return;
        }
        dataRoom.addUser(userRequest.userId, userRequest.role);
        dataRoom.save();
        success(`Approved user request ${userRequest.id} for user ${userRequest.userId} to join dataroom ${userRequest.dataRoomId} as ${userRequest.role}`);
    }

    let userRequests = UserRequests.load();
    if (userRequests.removeUserRequest(input.userRequestId)) {
        userRequests.save();
    }
}


/**
 * @transaction
 */
export function resetIdentities(input: SetIdentitiesInput): void {
    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }
    if (!user.isAdmin("super"))
    {
        error("You are not allowed to reset identities");
        return;
    }

    let keys = Keys.load();
    let save = false;
    if (input.resetKlaveServer) {
        if (keys.generateKlaveServerPrivateKey()) {
            save = true;
        }
    }
    if (input.resetStorageServer) {
        if (keys.generateStorageServerPrivateKey()) {
            save = true;
        }
    }
    if (save) {
        keys.save();
        success(`Identities reset successfully`);
    }
}

/**
 * @transaction
 */
export function exportStorageServerPrivateKey(input: ExportStorageServerPrivateKeyInput): void {
    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }
    if (!user.isAdmin("super"))
    {
        error("You are not allowed to export the storageServer private key");
        return;
    }
    let keys = Keys.load();
    if (keys.exportStorageServerPrivateKey(input.format)) {
        keys.save();
    }
}

/**
 * @query
 * @param input containing the following fields:
 * - userId: string
 * - role: string, "admin" or "user" - so far unused
 * @returns success boolean
 */
export function getPublicKeys(unused: string): void {
    let keys = Keys.load();
    keys.list();
}

/**
 * @transaction
 */
export function createDataRoom(input: DataRoomIDInput): void {
    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }
    if (!user.isAdmin("super"))
    {
        error("You are not allowed to create a dataroom.");
        return;
    }
    let dataRooms = DataRooms.load();
    if (dataRooms.addDataRoom(input.dataRoomId)) {
        dataRooms.save();
    }
}

/**
 * @transaction
 */
export function updateDataRoom(input: UpdateDataRoomInput): void {
    let dataRoom = DataRoom.load(input.dataRoomId);
    if (!dataRoom) {
        error(`DataRoom ${input.dataRoomId} does not exist. Create it first.`);
        return;
    }

    if (dataRoom.locked) {
        error(`DataRoom ${input.dataRoomId} is now locked.`);
        return;
    }

    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }

    if (input.operation == "addFile") {
        dataRoom.addFile(input.file);
    }
    else if (input.operation == "removeFile") {
        if (!user.isAdmin("super"))
        {
            if (!user.isAdmin(input.dataRoomId))
            {
                error("You are not allowed to remove a file.");
                return;
            }
        }
        dataRoom.removeFile(input.file);
    }
    else if (input.operation == "lock") {
        if (!user.isAdmin("super"))
        {
            if (!user.isAdmin(input.dataRoomId))
            {
                error("You are not allowed to lock a dataroom.");
                return;
            }
        }
        dataRoom.lock();
    }

    dataRoom.save();
}


/**
 * @query
 */
export function getFileUploadToken(input: GetFileUploadToken): void {
    let dataRoom = DataRoom.load(input.dataRoomId);
    if (!dataRoom) {
        error(`DataRoom ${input.dataRoomId} does not exist. Create it first.`);
        return;
    }

    if (dataRoom.locked) {
        error(`DataRoom ${input.dataRoomId} is now locked.`);
        return;
    }

    let keys = Keys.load();
    if (!keys.isSet()) {
        error(`Keys not set. Set the keys first.`);
        return;
    }
    dataRoom.getFileUploadToken(input.digestB64);
}

/**
 * @query
 */
export function listDataRooms(unused: string): void {
    let dataRooms = DataRooms.load();
    dataRooms.list();
}

/**
 * @query
 */
export function getDataRoomContent(input: DataRoomIDInput): void {
    let dataRoom = DataRoom.load(input.dataRoomId);
    if (!dataRoom) {
        error(`DataRoom ${input.dataRoomId} does not exist. Create it first.`);
        return;
    }
    dataRoom.getContent();
}

/**
 * @transaction
 */
export function clearAll(unused: string): void {
    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }
    if (!user.isAdmin("super"))
    {
        error("You are not allowed to clear all data.");
        return;
    }
    user.delete();

    let dataRooms = DataRooms.load();
    dataRooms.delete();

    let users = Users.load();
    users.delete();

    let keys = Keys.load();
    keys.clearKeys();

    let userRequests = UserRequests.load();
    userRequests.delete();
}

/**
 * @query
 */
export function getUserContent(unused: string): void {
    let user = User.load(Context.get('sender'));
    if (!user)
    {
        error("User not found");
        return;
    }
    user.getContent();
}