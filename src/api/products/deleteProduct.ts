import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {clearResult} from "../shared/clearResult";
import {TypedValues} from "ydb-sdk";

export const deleteProduct = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteProduct method")
    let result: Result
    const id = event.params.id
    let eventId: string = ''

    const queryFindEventID = `DECLARE $productId AS Utf8
                              SELECT eventId 
                              FROM products
                              WHERE id = $productId;`
    const paramsProduct = {
        '$productId': TypedValues.utf8(id)
    }
    result = await execute(queryFindEventID, paramsProduct)
    if (result.status === SUCCESS) {
        eventId = result.data[0].eventId
    }

    const queryDeleteProduct = `DECLARE $productId AS Utf8;
                                DELETE FROM products
                                WHERE id = $productId;`
    result = await execute(queryDeleteProduct, paramsProduct)
    if (result.status === SUCCESS) {
        const queryDeleteEaters = ` DECLARE $productId AS Utf8;
                                    DELETE FROM eaters 
                                    WHERE productId = $productId;`
        await execute(queryDeleteEaters, paramsProduct)
        await clearResult(eventId)
    }

    logger.info(`End deleteProduct method. Result: ${JSON.stringify(result)}`)
    return result
}
