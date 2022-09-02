import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {Event} from "../../models/events"

export const getEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getEvent method")
    let result: Result
    const id = event.params.id

    const query = `SELECT id, authorId, 
                    evented_at, 
                    isPublic, reason, status, title
                  FROM events
                  WHERE id = '${id}'`
    result = await execute(query)
    if (result.status === SUCCESS && result.data.length > 0) {
        const event: Event = {
            id: result.data[0].id,
            authorId: result.data[0].authorid,
            title: result.data[0].title,
            isPublic: result.data[0].isPublic,
            status: result.data[0].status,
            evented_at: (new Date(result.data[0].evented_at * 1000)).toISOString(),
            reason: result.data[0].reason
        }
        result = {
            ...result,
            data: { ...event }
        }
    }

    logger.info(`End getEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
