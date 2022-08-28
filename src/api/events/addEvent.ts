import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {v4 as uuid} from "uuid"
import {EventNew} from "../../models/events";
import {SUCCESS} from "../../consts";

export const addEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start addEvent method")
    let result: Result
    const newEvent: EventNew = JSON.parse(event.body)
    const uuidEvent = uuid()

    const query = `UPSERT INTO events (id, authorId, evented_at, isPublic, reason, status, title)
                    VALUES ('${uuidEvent}', '${newEvent.authorId}', CAST('${newEvent.evented_at}' as Datetime),
                    ${newEvent.isPublic}, '${newEvent.reason}', '${newEvent.status}', '${newEvent.title}')`
    result = await execute(query)
    if (result.status === SUCCESS) {
        result = {
            ...result,
            data: { id: uuidEvent }
        }
    }

    logger.info(`End addEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
