import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {TypedValues} from "ydb-sdk";

export const logout = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start logout method")
    let result: Result
    const token = event.requestContext.authorizer.token
    const query = `DECLARE $id AS Utf8;
                    DELETE FROM tokens
                    WHERE id = $id;`
    const params = {
        '$id': TypedValues.utf8(token)
    }
    result = await execute(query, params)

    logger.info(`End logout method. Result: ${JSON.stringify(result)}`)
    return result
}
