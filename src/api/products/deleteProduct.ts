import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {clearResult} from "../shared/clearResult";

export const deleteProduct = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteProduct method")
    let result: Result
    const id = event.params.id
    let eventId: string = ''

    const queryFindEventID = `select eventId from products
                                where id = '${id}'`
    result = await execute(queryFindEventID)
    if (result.status === SUCCESS) {
        eventId = result.data[0].eventId
    }

    const queryDeleteProduct = `DELETE FROM products
                    WHERE id = '${id}'`
    result = await execute(queryDeleteProduct)
    if (result.status === SUCCESS) {
        const queryDeleteEaters = `DELETE FROM eaters WHERE productId = '${id}'`
        await execute(queryDeleteEaters)
        await clearResult(eventId)
    }

    logger.info(`End deleteProduct method. Result: ${JSON.stringify(result)}`)
    return result
}
