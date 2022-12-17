import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {Member} from "../../models/member";
import {clearResult} from "../shared/clearResult";
import {TypedValues} from "ydb-sdk";
import {USER_BOT} from "../../consts";

export const updateMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start updateMember method")
    let result: Result
    const member: Member = JSON.parse(event.body)

    const query = ` DECLARE $username AS Utf8;
                    DECLARE $userId AS Utf8;
                    DECLARE $type AS Utf8;
                    UPDATE users
                    SET username = $username
                    WHERE id = $userId
                        AND type = $type;`
    const params = {
        '$username': TypedValues.utf8(member.user.username),
        '$userId': TypedValues.utf8(member.user.id),
        '$type': TypedValues.utf8(USER_BOT),
    }
    result = await execute(query, params)

    await clearResult(member.eventId)
    logger.info(`End updateMember method. Result: ${JSON.stringify(result)}`)
    return result
}
