import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {NewProfile} from "../../models/profile";
import {User} from "../../models/user";
import {TypedValues} from "ydb-sdk";

export const editProfile = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editProfile method")
    let result: Result
    const user: User = event.requestContext.authorizer.user
    const profile: NewProfile = JSON.parse(event.body)
    const query = ` DECLARE $username AS Utf8;
                    DECLARE $userId AS Utf8;
                    UPDATE users
                    SET username = $username
                    WHERE id = $userId;`
    const params = {
        '$username': TypedValues.utf8(profile.username),
        '$userId': TypedValues.utf8(user.id)
    }
    result = await execute(query, params)

    logger.info(`End editProfile method. Result: ${JSON.stringify(result)}`)
    return result
}
