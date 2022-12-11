import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {TypedValues} from "ydb-sdk";

export const deleteEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteEvent method")
    let result: Result
    const id = event.params.id

    const queryDeleteEvent = `DECLARE $eventId AS Utf8;
                              DELETE FROM events 
                              WHERE id = $eventId;`
    const params = {
        '$eventId': TypedValues.utf8(id)
    }
    result = await execute(queryDeleteEvent, params)
    if (result.status === SUCCESS) {
        const queryDeleteFromMembers = `DECLARE $eventId AS Utf8;
                                        DELETE FROM members ON
                                        SELECT id
                                        FROM members VIEW EVENT_ID_IDX 
                                        WHERE eventId = $eventId;`
        await execute(queryDeleteFromMembers, params)
        const queryDeleteFromProducts = `DECLARE $eventId AS Utf8;
                                         DELETE FROM products ON
                                         SELECT id
                                         FROM products VIEW EVENT_ID_IDX
                                         WHERE eventId = $eventId;`
        await execute(queryDeleteFromProducts, params)
    }

    logger.info(`End deleteEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
