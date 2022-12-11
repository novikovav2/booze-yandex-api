import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {MemberProduct} from "../../models/product";
import {SUCCESS} from "../../consts";
import {v4 as uuid} from "uuid"
import {clearResult} from "../shared/clearResult";
import {TypedValues} from "ydb-sdk";

export const updateProductsByMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start updateProductsByMember method")
    let result: Result
    const memberId: string = event.params.id
    const products: MemberProduct[] = JSON.parse(event.body)

    const queryGetMemberInfo = `DECLARE $memberId AS Utf8;
                                SELECT eventId, userId
                                FROM members
                                WHERE id = $memberId;`
    const paramsMember = {
        '$memberId': TypedValues.utf8(memberId)
    }
    result = await execute(queryGetMemberInfo, paramsMember)
    if (result.status === SUCCESS) {
        const eventId = result.data[0].eventId
        const userId = result.data[0].userId
        for (const product of products) {
            const queryCleanEater = `   DECLARE $productId AS Utf8;
                                        DECLARE $userId AS Utf8;
                                        DELETE FROM eaters ON
                                        SELECT id
                                        FROM eaters VIEW PRODUCT_ID_IDX
                                        WHERE productId = $productId
                                            AND userId = $userId;`
            const paramEaters = {
                '$productId': TypedValues.utf8(product.id),
                '$userId': TypedValues.utf8(userId)
            }
            await execute(queryCleanEater, paramEaters)
            if (product.eaten) {
                const eaterId = uuid()
                const queryAddEater = ` DECLARE $eaterId AS Utf8;
                                        DECLARE $number AS Int32;
                                        DECLARE $productId AS Utf8;
                                        DECLARE $userId AS Utf8;
                                        INSERT INTO eaters (id, number, productId, userId)
                                        VALUES ($eaterId, $number, $productId, $userId);`
                const paramAddEater = {
                    '$eaterId': TypedValues.utf8(eaterId),
                    '$number': TypedValues.int32(0),
                    '$productId': TypedValues.utf8(product.id),
                    '$userId': TypedValues.utf8(userId)
                }
                result = await execute(queryAddEater, paramAddEater)
            }
        }
        await clearResult(eventId)
    }

    logger.info(`End updateProductsByMember method. Result: ${JSON.stringify(result)}`)
    return result
}
