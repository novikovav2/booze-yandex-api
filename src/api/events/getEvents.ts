import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";
import {TypedValues} from "ydb-sdk";

export const getEvents = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getEvents method")
    let result: Result
    const status = event.params.status
    const userId = event.requestContext.authorizer.user.id

    let query = ` DECLARE $userId AS Utf8;
                  DECLARE $status AS Utf8;
                  SELECT e.id as id, 
                        authorId, 
                        evented_at, isPublic, reason, status, title, withCommonMoney
                  FROM events e
                  CROSS JOIN members m
                  WHERE m.eventId = e.id 
                    AND m.userId = $userId
                    AND e.status = $status;`

    const params = {
        '$userId': TypedValues.utf8(userId),
        '$status': TypedValues.utf8(status)
    }

    result = await execute(query, params)

    logger.info(`End getEvents method. Result: ${JSON.stringify(result)}`)
    return result
}
