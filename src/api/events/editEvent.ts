import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {EventNew} from "../../models/events";

export const editEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editEvent method")
    let result: Result
    const id = event.params.id
    const newEvent: EventNew = JSON.parse(event.body)
    const query = `$parse1 = DateTime::Parse("%Y-%m-%dT%H:%M:%SZ");
                    UPSERT INTO events (id, title, evented_at, isPublic, reason, status )
                    VALUES ('${id}',  '${newEvent.title}',
                    DateTime::MakeDatetime($parse1('${newEvent.evented_at}')) ,
                    ${newEvent.isPublic}, '${newEvent.reason}', '${newEvent.status}')`
    result = await execute(query)

    logger.info(`End editEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
