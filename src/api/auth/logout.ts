import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";

export const logout = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start logout method")
    let result: Result
    const token = event.requestContext.authorizer.token
    const query = `DELETE FROM tokens
                    WHERE id = '${token}'`
    result = await execute(query)

    logger.info(`End logout method. Result: ${JSON.stringify(result)}`)
    return result
}
