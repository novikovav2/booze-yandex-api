import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {NewProduct} from "../../models/product";
import {SUCCESS} from "../../consts";
import {v4 as uuid} from "uuid"
import {clearResult} from "../shared/clearResult";
import {TypedValues} from "ydb-sdk";

export const editProduct = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editProduct method")
    let result: Result

    const product: NewProduct = JSON.parse(event.body)
    const id = event.params.id

    const query = ` DECLARE $productId AS Utf8;
                    DECLARE $title AS Utf8;
                    DECLARE $eventId AS Utf8;
                    DECLARE $buyerId AS Utf8;
                    DECLARE $total AS Int32;
                    DECLARE $price AS Int32;
                    UPSERT INTO products (id, title, eventId, buyerId, total, price )
                    VALUES ($productId, $title, $eventId,
                            $buyerId, $total, $price);`
    const paramsProduct = {
        '$productId': TypedValues.utf8(id),
        '$title': TypedValues.utf8(product.title),
        '$eventId': TypedValues.utf8(product.eventId),
        '$buyerId': TypedValues.utf8(product.buyerId),
        '$total': TypedValues.int32(product.total),
        '$price': TypedValues.int32(product.price),
    }
    result = await execute(query, paramsProduct)
    if (result.status === SUCCESS) {
        const queryCleanEaters = `DECLARE $productId AS Utf8;
                                  DELETE FROM eaters
                                  WHERE productId = $productId;`
        const paramsProduct = {
            '$productId': TypedValues.utf8(id)
        }
        await execute(queryCleanEaters, paramsProduct)

        for (const eater of product.eaters) {
            const eaterId = uuid()
            const queryEaters = `DECLARE $eaterId AS Utf8;
                                 DECLARE $number AS Int32;
                                 DECLARE $productId AS Utf8;
                                 DECLARE $userId AS Utf8;
                                 INSERT INTO eaters (id, number, productId, userId)
                                 VALUES ($eaterId, $number, $productId, $userId);`
            const paramsEater = {
                '$eaterId': TypedValues.utf8(eaterId),
                '$number': TypedValues.int32(0),
                '$productId': TypedValues.utf8(id),
                '$userId': TypedValues.utf8(eater.user.id),
            }
            await execute(queryEaters, paramsEater)
        }
        await clearResult(product.eventId)
    }

    logger.info(`End editProduct method. Result: ${JSON.stringify(result)}`)
    return result
}
