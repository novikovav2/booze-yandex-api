import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute} from "../../db";

export const getEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
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
    return result
}