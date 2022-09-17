import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {NewProduct} from "../../models/product";
import {SUCCESS} from "../../consts";
import {v4 as uuid} from "uuid"

export const editProduct = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editProduct method")
    let result: Result

    const product: NewProduct = JSON.parse(event.body)
    const id = event.params.id

    const query = `UPSERT INTO products (id, title, eventId, buyerId, total, price )
                    VALUES ('${id}', '${product.title}', '${product.eventId}',
                            '${product.buyerId}', ${product.total}, ${product.price})`
    result = await execute(query)
    if (result.status === SUCCESS) {
        const queryCleanEaters = `DELETE FROM eaters
                                    WHERE productId = '${id}'`
        await execute(queryCleanEaters)

        for (const eater of product.eaters) {
            const eaterId = uuid()
            const queryEaters = `INSERT INTO eaters (id, number, productId, userId)
                                VALUES ('${eaterId}', 0, '${id}', '${eater.user.id}')`
            await execute(queryEaters)
        }
    }

    logger.info(`End editProduct method. Result: ${JSON.stringify(result)}`)
    return result
}
