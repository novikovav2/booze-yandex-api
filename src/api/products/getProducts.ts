import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {Product} from "../../models/product";
import {TypedValues} from "ydb-sdk";

export const getProducts = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getProducts method")

    let result: Result
    const id = event.params.id
    const query = ` DECLARE $eventId AS Utf8;
                    SELECT p.id as id,
                            p.eventId as eventId,
                            p.title as title,
                            p.price as price,
                            p.total as total,
                            u.id as userId,
                            u.username as username,
                            u.type as type,
                            count(e.id) as count
                    FROM products p
                    LEFT JOIN users u ON p.buyerId = u.id 
                    LEFT JOIN eaters e ON p.id = e.productId 
                    WHERE p.eventId = $eventId
                    group by p.id, p.eventId, p.title, p.price, p.total,
                                u.id, u.username, u.type
                    order by title;`
    const params = {
        '$eventId': TypedValues.utf8(id)
    }
    result = await execute(query, params)
    logger.info(`Result after select from products: ${JSON.stringify(result)}`)
    if (result.status === SUCCESS) {
        let products: Product[] = []
        for (const item of result.data) {
            let product: Product = {
                id: item.id,
                eventId: item.eventId,
                title: item.title,
                price: item.price,
                total: item.total,
                buyer: {
                        id: item.userId,
                        username: item.username,
                        type: item.type
                },
                eatersCount: item.count.low
            }
            products.push(product)
        }
        result = {
            ...result,
            data: products
        }
    }

    logger.info(`End getProducts method. Result: ${JSON.stringify(result)}`)
    return result
}
