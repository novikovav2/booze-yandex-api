import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {NewProduct} from "../../models/product";
import {v4 as uuid} from "uuid"
import {SUCCESS} from "../../consts";

export const addProduct = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start addProduct method")
    let result: Result

    const product: NewProduct = JSON.parse(event.body)
    const uuidNew = uuid()


    const query = `UPSERT INTO products (id, title, eventId, buyerId, total, price )
                    VALUES ('${uuidNew}', '${product.title}', '${product.eventId}',
                            '${product.buyerId}', ${product.total}, ${product.price})`
    result = await execute(query)
    if (result.status === SUCCESS) {
        for (const eater of product.eaters) {
            const eaterId = uuid()
            const queryEaters = `UPSERT INTO eaters (id, number, productId, userId)
                                VALUES ('${eaterId}', 0, '${uuidNew}', '${eater.user.id}')`
            await execute(queryEaters)
        }
    }

    logger.info(`End addProduct method. Result: ${JSON.stringify(result)}`)
    return result
}
