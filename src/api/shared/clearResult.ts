import {execute} from "../../db";
import {TypedValues} from "ydb-sdk";

export const clearResult = async (eventId: string) => {
    const query = `DECLARE $eventId AS Utf8;
                   DELETE FROM results ON
                    SELECT id
                    FROM results VIEW EVENT_ID_IDX
                   WHERE eventId = $eventId;`
    const params = {
        '$eventId': TypedValues.utf8(eventId)
    }
    return await execute(query, params)
}
