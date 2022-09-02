import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute} from "../../db";

export const getEvents = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    let result: Result
    const status = event.params.status
    const userId = event.requestContext.authorizer.user.id

    let query = `SELECT e.id, authorId, evented_at, isPublic, reason, status, title
                  FROM events e
                  CROSS JOIN members m
                  WHERE m.eventId = e.id AND m.userId = '${userId}'`

    switch (status) {
        case "active":
            query = query + ` AND e.status = 'active'`
            break
        case "archive":
            query = query + ` AND e.status = 'archive'`
            break
        default:
            break
    }

    result = await execute(query)
    return result
}
