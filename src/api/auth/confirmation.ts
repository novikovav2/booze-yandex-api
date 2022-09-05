import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {ConfirmationData} from "../../models/auth";
import {BAD_REQUEST, SUCCESS} from "../../consts";

export const confirmation = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start Confirmation method")
    let result: Result = {
        status: BAD_REQUEST,
        data: { message: 'Confirmation token invalid' }
    }
    const data: ConfirmationData = JSON.parse(event.body)
    const queryCheckConfirm = `SELECT userId 
                                FROM confirmations
                                where id = '${data.confirmationId}'`
    const resultCheck = await execute(queryCheckConfirm)
    if (resultCheck.status === SUCCESS && resultCheck.data.length > 0) {
        logger.info("Confirmation token found")
        const query = `UPDATE users
                        SET isActive = true
                        where id = '${resultCheck.data[0].userId}'`
        result = await execute(query)
    }

    logger.info(`End Confirmation method. Result: ${JSON.stringify(result)}`)
    return result
}
