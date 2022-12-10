import {YC} from "../../yc";
import {Product} from "../../models/product";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {Eater} from "../../models/eater";
import {TypedValues} from "ydb-sdk";

export const getProduct = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getProduct method")
    let result: Result
    const id = event.params.id
    let product: Product

    const query = ` DECLARE $productId AS Utf8;
                    SELECT p.id as id,  
                            p.eventId as eventId, 
                            p.price as price, 
                            p.title as title, 
                            p.total as total,
                            u.id as userId,
                            u.username as username,
                            u.type as type
                      FROM products p
                      CROSS JOIN users u
                      WHERE p.buyerId = u.id
                        AND p.id = $productId;`
    const paramsProduct = {
        '$productId': TypedValues.utf8(id)
    }
    result = await execute(query, paramsProduct)
    if (result.status === SUCCESS) {
        product = {
            id: id,
            eventId: result.data[0].eventId,
            title: result.data[0].title,
            price: result.data[0].price,
            total: result.data[0].total,
            buyer: {
                id: result.data[0].userId,
                username: result.data[0].username,
                type: result.data[0].type
            }
        }
        const queryEater = `DECLARE $productId AS Utf8;
                            SELECT e.id as id, 
                                       e.productId as productId, 
                                       e.number as number,
                                       e.userId as userId, 
                                       u.username as username,
                                       u.type as type
                            FROM eaters e
                            CROSS JOIN users u
                            WHERE e.userId = u.id
                                AND productId = $productId
                            order by username;`
        const eaterResult = await execute(queryEater, paramsProduct)
        const eaters: Eater[] = []
        eaterResult.data.forEach((e) => {
            const eater: Eater = {
                user: {
                    id: e.userId,
                    username: e.username,
                    type: e.type
                },
                count: e.number
            }
            eaters.push(eater)
        })
        product.eaters = eaters
    }


    result = {
        ...result,
        data: product
    }

    logger.info(`End getProduct method. Result: ${JSON.stringify(result)}`)
    return result
}
