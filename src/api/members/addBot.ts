import {YC} from "../../yc";
import {Result} from "../../models/result";
import {NewMember} from "../../models/member";
import {v4 as uuid} from "uuid"
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {clearResult} from "../shared/clearResult";
import {TypedValues} from "ydb-sdk";

export const addBot = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start addBot method")

    let result: Result
    const member: NewMember = JSON.parse(event.body)
    const uuidBot = uuid()

    const queryCreateBot = `DECLARE $userId AS Utf8;
                            DECLARE $type AS UTF8;
                            DECLARE $username AS UTF8; 
                            INSERT INTO users (id, type, username)
                           VALUES ($userId, $type, $username);`
    const paramsUser = {
        '$userId': TypedValues.utf8(uuidBot),
        '$type': TypedValues.utf8('bot'),
        '$username': TypedValues.utf8(member.username)
    }
    result = await execute(queryCreateBot, paramsUser)

    if (result.status === SUCCESS) {
        const uuidMember = uuid()
        const queryAddBotToEvent = `DECLARE $memberId AS Utf8;
                                    DECLARE $eventId AS Utf8;
                                    DECLARE $userId AS Utf8;
                                    INSERT INTO members (id, eventId, userId)
                                    VALUES ($memberId, $eventId, $userId);`
        const paramsMember = {
            '$memberId': TypedValues.utf8(uuidMember),
            '$eventId': TypedValues.utf8(member.eventId),
            '$userId': TypedValues.utf8(uuidBot),
        }
        result = await execute(queryAddBotToEvent, paramsMember)
    }

    await clearResult(member.eventId)
    logger.info(`End addBot method. Result: ${JSON.stringify(result)}`)
    return result
}
