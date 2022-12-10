import {execute} from "../../db";
import {TypedValues} from "ydb-sdk";

export const clearResult = async (eventId: string) => {
    const query = `DECLARE $eventId AS Utf;
                   DELETE FROM results
                   WHERE eventId = $eventId;`
    const params = {
        '$eventId': TypedValues.utf8(eventId)
    }
    return await execute(query, params)
}
