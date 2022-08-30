import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {NewProfile} from "../../models/profile";

export const editProfile = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editProfile method")
    let result: Result
    const id = event.params.id
    const profile: NewProfile = JSON.parse(event.body)
    const query = `UPDATE users
                    SET username = '${profile.username}'
                    WHERE id = '${id}'`
    result = await execute(query)

    logger.info(`End editProfile method. Result: ${JSON.stringify(result)}`)
    return result
}
