import {execute, logger} from "../../db";
import {Result} from "../../models/result";
import {TypedValues} from "ydb-sdk";
import {v4 as uuid} from "uuid"
import {COMMON_FUND, SUCCESS, USER_FUND} from "../../consts";
import {removeMember} from "../shared/removeMember";

export const addCommonFund = async (eventId: string): Promise<Result> => {
    logger.info("Start addCommonFund method")
    let result: Result

    // Check common fund exist
    const queryCheck = `DECLARE $eventId AS Utf8;
                        DECLARE $type AS Utf8;
                        DECLARE $username AS Utf8;
                        SELECT m.id
                        FROM members VIEW EVENT_ID_IDX as m
                        LEFT JOIN users u ON m.userId = u.id
                        WHERE eventId = $eventId
                            AND u.type = $type`
    const paramsCheck = {
        '$eventId': TypedValues.utf8(eventId),
        '$type': TypedValues.utf8(USER_FUND)
    }
    result = await execute(queryCheck, paramsCheck)
    if (result.status === SUCCESS && result.data.length === 0) {
        const queryCreateBot = `DECLARE $id AS Utf8;
                            DECLARE $type AS Utf8;
                            DECLARE $username AS Utf8;
                            INSERT INTO users (id, type, username)
                            VALUES ($id, $type, $username);`
        const userId = uuid()
        const paramsCreateBot = {
            '$id': TypedValues.utf8(userId),
            '$type': TypedValues.utf8(USER_FUND),
            '$username': TypedValues.utf8(COMMON_FUND)
        }
        result = await execute(queryCreateBot, paramsCreateBot)
        if (result.status === SUCCESS) {
            const query = ` DECLARE $id AS Utf8;
                        DECLARE $eventId AS Utf8;
                        DECLARE $userId AS Utf8;
                        INSERT INTO members (id, eventId, userId)
                        VALUES ($id, $eventId, $userId);`
            const params = {
                '$id': TypedValues.utf8(uuid()),
                '$eventId': TypedValues.utf8(eventId),
                '$userId': TypedValues.utf8(userId)
            }
            result = await execute(query, params)
        }
    }

    logger.info(`End addCommonFund method. Result: ${JSON.stringify(result)}`)
    return result
}

export const removeCommonFund = async (eventId: string): Promise<Result> => {
    logger.info("Start removeCommonFund method")
    let result: Result

    // Check common fund exist
    const queryCheck = `DECLARE $eventId AS Utf8;
                        DECLARE $type AS Utf8;
                        DECLARE $username AS Utf8;
                        SELECT m.id
                        FROM members VIEW EVENT_ID_IDX as m
                        LEFT JOIN users u ON m.userId = u.id
                        WHERE eventId = $eventId
                            AND u.type = $type`
    const paramsCheck = {
        '$eventId': TypedValues.utf8(eventId),
        '$type': TypedValues.utf8(USER_FUND)
    }
    result = await execute(queryCheck, paramsCheck)
    if (result.status === SUCCESS && result.data.length > 0) {
        const memberId = result.data[0].id
        result = await removeMember(memberId)
    }

    logger.info(`End removeCommonFund method. Result: ${JSON.stringify(result)}`)
    return result
}
