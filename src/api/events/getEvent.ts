import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";

export const getEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getEvent method")
    let result: Result
    const id = event.params.id

    const query = `SELECT id, authorId, evented_at, isPublic, reason, status, title
                  FROM events
                  WHERE id = '${id}'`
    result = await execute(query)
    result = {
        ...result,
        data: result.data[0]
    }
    logger.info(`End getEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
