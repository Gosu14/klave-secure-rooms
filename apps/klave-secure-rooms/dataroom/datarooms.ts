import { Ledger, JSON, Context } from "@klave/sdk";
import { success, error } from "../klave/types";
import { DataRoom } from "./dataroom";
import { ListOutput } from "./outputs/types";
import { Notifier } from "@klave/sdk/assembly";

const DataRoomsTable = "DataRoomsTable";

/**
 * An DataRooms is associated with a list of dataRooms and holds dataRooms.
 */
@JSON
export class DataRooms {
    dataRooms: Array<string>;

    constructor() {
        this.dataRooms = new Array<string>();
    }

    /**
     * load the dataRooms from the ledger.
     * @returns true if the dataRooms was loaded successfully, false otherwise.
     */
    static load(): DataRooms {
        let dataRoomsTable = Ledger.getTable(DataRoomsTable).get("ALL");
        if (dataRoomsTable.length == 0) {
            // success(`New DataRooms Table created successfully`);
            return new DataRooms;
        }
        let wlt = JSON.parse<DataRooms>(dataRoomsTable);
        // success(`DataRooms loaded successfully: ${dataRoomsTable}`);
        return wlt;
    }

    /**
     * save the dataRooms to the ledger.
     */
    save(): void {
        let dataRoomsTable = JSON.stringify<DataRooms>(this);
        Ledger.getTable(DataRoomsTable).set("ALL", dataRoomsTable);
        // success(`DataRooms saved successfully: ${dataRoomsTable}`);
    }

    /**
     * Add a dataroom to the list of dataRooms.
     * @param dataroomId The id of the dataroom to add.
     */
    addDataRoom(dataroomId: string): boolean {
        let existingDataRoom = DataRoom.load(dataroomId);
        if (existingDataRoom) {
            error(`DataRoom already exists: ${dataroomId}`);
            return false;
        }
        let dataroom = new DataRoom(dataroomId);
        dataroom.users.push(Context.get('sender'));
        dataroom.save();
        this.dataRooms.push(dataroom.id);

        success(`DataRoom added successfully: ${dataroom.id} `);
        return true;
    }

    /**
     * Remove a dataroom from the list of dataRooms.
     * @param dataroomId The id of the dataroom to remove.
     */
    removeDataRoom(dataroomId: string): boolean {
        let dataroom = DataRoom.load(dataroomId);
        if (!dataroom) {
            error("DataRoom not found: " + dataroomId);
            return false;
        }
        dataroom.delete();

        let index = this.dataRooms.indexOf(dataroomId);
        this.dataRooms.splice(index, 1);
        success("DataRoom removed successfully: " + dataroomId);
        return true;
    }

    /**
     * list all the dataRooms in the dataRooms.
     * @returns
     */
    list(): void {
        if (this.dataRooms.length == 0) {
            success(`No dataroom found in the list of dataRooms`);
        }

        let sender = Context.get('sender');

        Notifier.sendJson<ListOutput>({
            requestId: Context.get('request_id'),
            result: this.dataRooms
        });
    }

    delete(): void {
        for (let i = 0; i < this.dataRooms.length; i++) {
            let dataroom = DataRoom.load(this.dataRooms[i]);
            if (dataroom) {
                dataroom.delete();
            }
        }
        this.dataRooms = [];
        this.save();
    }
}