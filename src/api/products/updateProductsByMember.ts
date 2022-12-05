import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {MemberProduct} from "../../models/product";
import {SUCCESS} from "../../consts";
import {v4 as uuid} from "uuid"
import {clearResult} from "../shared/clearResult";

export const updateProductsByMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start updateProductsByMember method")
    let result: Result
    const memberId: string = event.params.id
    const products: MemberProduct[] = JSON.parse(event.body)

    const queryGetMemberInfo = `SELECT eventId, userId
                                FROM members
                                WHERE id = '${memberId}'`
    result = await execute(queryGetMemberInfo)
    if (result.status === SUCCESS) {
        const eventId = result.data[0].eventId
        const userId = result.data[0].userId
        for (const product of products) {
            const queryCleanEater = `DELETE FROM eaters
                                        WHERE productId = '${product.id}'
                                        AND userId = '${userId}'`
            await execute(queryCleanEater)
            if (product.eaten) {
                const eaterId = uuid()
                const queryAddEater = `INSERT INTO eaters (id, number, productId, userId)
                                        VALUES ('${eaterId}', 0, '${product.id}', '${userId}')`
                result = await execute(queryAddEater)
            }
        }
        await clearResult(eventId)
    }

    logger.info(`End updateProductsByMember method. Result: ${JSON.stringify(result)}`)
    return result
}
