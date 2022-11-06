import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {BAD_REQUEST, SUCCESS} from "../../consts";

export const deleteMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteMember method")
    let result: Result
    let member: any
    const id = event.params.id          // member.id

    // Находим userId и eventId
    const queryFindID = `SELECT eventId, userId
                        FROM members
                        WHERE id = '${id}'`
    result = await execute(queryFindID)
    if (result.status === SUCCESS) {
        logger.info("IDs received successfully")
        member = {
            id,
            eventId: result.data[0].eventId,
            userId: result.data[0].userId
        }
    }
    // Проверяем, чтобы участник не покупал продукты
    if (member) {
        const queryProducts = `SELECT id
                                FROM products
                                WHERE eventId = '${member.eventId}'
                                    AND buyerId = '${member.userId}'`
        result = await execute(queryProducts)
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
        const queryEaters = `DELETE FROM eaters
                                WHERE userId = '${member.userId}'
                                    AND productId IN (select id from products
                                                        where eventId = '${member.eventId}')`
        result = await execute(queryEaters)
        // Удаляем участника окончательно
        if (result.status === SUCCESS) {
            logger.info("Eaters are deleted")
            const query = `DELETE FROM members
                    WHERE id = '${id}'`
            result = await execute(query)
        }
    }

    logger.info(`End deleteMember method. Result: ${JSON.stringify(result)}`)
    return result
}
