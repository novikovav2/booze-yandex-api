import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";

export const deleteMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteMember method")
    let result: Result
    const id = event.params.id
    const query = `DELETE FROM members
                    WHERE id = '${id}'`
    result = await execute(query)

    logger.info(`End deleteMember method. Result: ${JSON.stringify(result)}`)
    return result
}
