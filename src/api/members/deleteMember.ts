import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {BAD_REQUEST, SUCCESS} from "../../consts";
import {clearResult} from "../shared/clearResult";
import {TypedValues} from "ydb-sdk";

export const deleteMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteMember method")
    let result: Result
    let member: any
    const id = event.params.id          // member.id

    // Находим userId и eventId
    const queryFindID = `DECLARE $memberId AS Utf8;
                        SELECT eventId, userId
                        FROM members
                        WHERE id = $memberId;`
    const paramsMember = {
        '$memberId': TypedValues.utf8(id)
    }
    result = await execute(queryFindID, paramsMember)
    if (result.status === SUCCESS) {
        logger.info("IDs received successfully")
        member = {
            id,
            eventId: result.data[0].eventId,
            userId: result.data[0].userId
        }
    }
    const params = {
        '$eventId': TypedValues.utf8(member.eventId),
        '$userId': TypedValues.utf8(member.userId)
    }
    // Проверяем, чтобы участник не покупал продукты
    if (member) {
        const queryProducts = ` DECLARE $eventId AS Utf8;
                                DECLARE $userId AS Utf8;
                                SELECT id
                                FROM products
                                WHERE eventId = $eventId
                                    AND buyerId = $userId;`

        result = await execute(queryProducts, params)
        if (result.status === SUCCESS && result.data.length > 0) {
            result = {
                status: BAD_REQUEST,
                data: {message: "Member bought products"}
            }
        }
    }

    // Удаляем участника
    if (result.status === SUCCESS) {
        logger.info("Member did not buy products")
        // Удаляем участника как едока
        const queryEaters = `   DECLARE $eventId AS Utf8;
                                DECLARE $userId AS Utf8;
                                DELETE FROM eaters
                                WHERE userId = $userId
                                    AND productId IN (select id from products
                                                        where eventId = $eventId);`
        result = await execute(queryEaters, params)
        // Удаляем участника окончательно
        if (result.status === SUCCESS) {
            logger.info("Eaters are deleted")
            const query = ` DECLARE $memberId AS Utf8;
                            DELETE FROM members
                            WHERE id = $memberId;`
            result = await execute(query, paramsMember)

            // Удаляем user если он бот
            const queryRemoveUser = `DECLARE $userId AS Utf8;
                                     DECLARE $type AS Utf8;
                                     DELETE FROM users
                                     WHERE id = $userId
                                        AND type = $type;`
            const paramsUser = {
                '$userId': TypedValues.utf8(member.userId),
                '$type': TypedValues.utf8('bot')
            }
            await execute(queryRemoveUser, paramsUser)
        }
        await clearResult(member.eventId)
    }

    logger.info(`End deleteMember method. Result: ${JSON.stringify(result)}`)
    return result
}
