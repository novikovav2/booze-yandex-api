import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute} from "../../db";

export const getEvents = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    let result: Result
    const status = event.params.status

    let query = `SELECT id, authorId, evented_at, isPublic, reason, status, title
                  FROM events `

    switch (status) {
        case "active":
            query = query + ` WHERE status = 'active'`
            break
        case "archive":
            query = query + ` WHERE status = 'archive'`
            break
        default:
            break
    }

    result = await execute(query)
    return result
}
