import {YC} from "../../yc";
import {Result} from "../../models/result";

export const addBot = async (event: YC.CloudFunctionsHttpEvent,
                             logger: any): Promise<Result> => {
    logger.info("Start addBot method")

    let result: Result
    const member = JSON.parse(event.body)
    logger.info(`BODY: ${JSON.stringify(member)}`)

    return result
}
