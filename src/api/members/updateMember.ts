import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {Member} from "../../models/member";
import {clearResult} from "../shared/clearResult";

export const updateMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start updateMember method")
    let result: Result
    const member: Member = JSON.parse(event.body)

    const query = `UPDATE users
                    SET username = '${member.user.username}'
                    WHERE id = '${member.user.id}'
                        AND type = 'bot'`
    result = await execute(query)

    await clearResult(member.eventId)
    logger.info(`End updateMember method. Result: ${JSON.stringify(result)}`)
    return result
}
