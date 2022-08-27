import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {Product} from "../../models/product";
import {Eater} from "../../models/eater";

export const getProducts = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getProducts method")

    let result: Result
    const id = event.params.id
    const query = `SELECT p.id as id,
                            p.eventId as eventId,
                            p.title as title,
                            p.price as price,
                            p.total as total,
                            u.id as userId,
                            u.username as username,
                            u.type as type
                    FROM products p
                    CROSS JOIN users u
                    WHERE p.buyerId = u.id
                        AND p.eventId = '${id}'`
    result = await execute(query)
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
                }
            }

            const queryEater = `SELECT e.id as id, 
                                       e.productId as productId, 
                                       e.number as number,
                                       e.userId as userId, 
                                       u.username as username,
                                       u.type as type
                            FROM eaters e
                            CROSS JOIN users u
                            WHERE e.userId = u.id
                                AND productId = '${item.id}'`
            const eaterResult = await execute(queryEater)
            logger.info(`Result after select eater: ${JSON.stringify(eaterResult)}`)
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
