import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";

export const deleteEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteEvent method")
    let result: Result
    const id = event.params.id

    const queryDeleteEvent = `DELETE FROM events WHERE id = '${id}'`
    result = await execute(queryDeleteEvent)
    if (result.status === SUCCESS) {
        const queryDeleteFromMembers = `DELETE FROM members WHERE eventID = '${id}'`
        await execute(queryDeleteFromMembers)
        const queryDeleteFromProducts = `DELETE FROM products WHERE eventID = '${id}'`
        await execute(queryDeleteFromProducts)
    }

    logger.info(`End deleteEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
