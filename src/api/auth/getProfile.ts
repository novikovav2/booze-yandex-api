import {YC} from "../../yc";
import {Result} from "../../models/result";
import {logger} from "../../db";
import {User} from "../../models/user";
import {SUCCESS} from "../../consts";

export const getProfile = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getProfile method")
    let result: Result
    const user: User = event.requestContext.authorizer.user

    result = {
        status: SUCCESS,
        data: user
    }

    logger.info(`End getProfile method. Result: ${JSON.stringify(result)}`)
    return result
}
