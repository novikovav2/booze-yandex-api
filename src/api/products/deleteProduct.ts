import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";

export const deleteProduct = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteProduct method")
    let result: Result
    const id = event.params.id
    const queryDeleteProduct = `DELETE FROM products
                    WHERE id = '${id}'`
    result = await execute(queryDeleteProduct)
    if (result.status === SUCCESS) {
        const queryDeleteEaters = `DELETE FROM eaters WHERE productId = '${id}'`
        await execute(queryDeleteEaters)
    }

    logger.info(`End deleteProduct method. Result: ${JSON.stringify(result)}`)
    return result
}
