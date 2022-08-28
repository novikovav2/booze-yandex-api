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

    const query = `$parse1 = DateTime::Parse("%Y-%m-%dT%H:%M:%SZ");
                    UPSERT INTO events (id, authorId, evented_at, isPublic, reason, status, title)
                    VALUES ('${uuidEvent}', '${newEvent.authorId}', 
                    DateTime::MakeDatetime($parse1('${newEvent.evented_at}')) ,
                    ${newEvent.isPublic}, '${newEvent.reason}', '${newEvent.status}', 
                    '${newEvent.title}')`
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
