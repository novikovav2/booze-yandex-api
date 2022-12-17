import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {clearResult} from "../shared/clearResult";
import {Member} from "../../models/member";
import {TypedValues} from "ydb-sdk";

export  const updateMembers = async (event: YC.CloudFunctionsHttpEvent) : Promise<Result> => {
    logger.info("Start updateMembers method")
    let result: Result
    const eventId = event.params.id
    const members: Member[] = JSON.parse(event.body)
    const query = ` DECLARE $money AS Int32;
                    DECLARE $memberId AS Utf8;
                    UPDATE members 
                    SET money = $money
                    WHERE id = $memberId;`
    for (const member of members) {
        const params = {
            '$money': TypedValues.int32(member.money),
            '$memberId': TypedValues.utf8(member.id)
        }
        result = await  execute(query, params)
    }

    await clearResult(eventId)
    logger.info(`End updateMembers method. Result: ${JSON.stringify(result)}`)
    return result
}
