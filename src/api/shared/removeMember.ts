import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {TypedValues} from "ydb-sdk";
import {BAD_REQUEST, SUCCESS, USER_BOT} from "../../consts";
import {clearResult} from "./clearResult";

export const removeMember = async (memberId: string): Promise<Result> => {
    logger.info("Start removeMember method")
    let result: Result

    // Находим userId и eventId
    const queryFindID = `DECLARE $memberId AS Utf8;
                        SELECT eventId, userId
                        FROM members
                        WHERE id = $memberId;`
    const paramsMember = {
        '$memberId': TypedValues.utf8(memberId)
    }
    result = await execute(queryFindID, paramsMember)
    if (result.status === SUCCESS && result.data.length > 0) {
        logger.info("IDs received successfully")
        const eventId = result.data[0].eventId
        const userId = result.data[0].userId

        const params = {
            '$eventId': TypedValues.utf8(eventId),
            '$userId': TypedValues.utf8(userId)
        }

        // Проверяем, чтобы участник не покупал продукты
        const queryProducts = ` DECLARE $eventId AS Utf8;
                                DECLARE $userId AS Utf8;
                                SELECT id
                                FROM products VIEW EVENT_ID_IDX
                                WHERE eventId = $eventId
                                    AND buyerId = $userId;`

        result = await execute(queryProducts, params)
        if (result.status === SUCCESS && result.data.length > 0) {
            result = {
                 status: BAD_REQUEST,
                 data: {message: "Member bought products"}
            }
        } else {
            logger.info("Member did not buy products")
            // Удаляем участника как едока
            const queryEaters = `   DECLARE $eventId AS Utf8;
                                DECLARE $userId AS Utf8;
                                DELETE FROM eaters ON
                                SELECT id
                                FROM eaters VIEW PRODUCT_ID_IDX
                                WHERE userId = $userId
                                    AND productId IN (select id 
                                                    from products VIEW EVENT_ID_IDX
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
                    '$userId': TypedValues.utf8(userId),
                    '$type': TypedValues.utf8(USER_BOT)
                }
                await execute(queryRemoveUser, paramsUser)
            }
            await clearResult(eventId)
        }
    }

    logger.info(`End removeMember method. Result: ${JSON.stringify(result)}`)
    return result
}
