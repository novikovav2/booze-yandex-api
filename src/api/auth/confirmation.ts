import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {ConfirmationData} from "../../models/auth";
import {BAD_REQUEST, SUCCESS} from "../../consts";
import {TypedValues} from "ydb-sdk";

export const confirmation = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start Confirmation method")
    let result: Result = {
        status: BAD_REQUEST,
        data: { message: 'Confirmation token invalid' }
    }
    const data: ConfirmationData = JSON.parse(event.body)
    const queryCheckConfirm = `DECLARE $id AS Utf8;
                                SELECT userId 
                                FROM confirmations
                                where id = $id;`
    const params = {
        '$id': TypedValues.utf8(data.confirmationId)
    }
    const resultCheck = await execute(queryCheckConfirm, params)
    if (resultCheck.status === SUCCESS && resultCheck.data.length > 0) {
        logger.info("Confirmation token found")
        const query = `DECLARE $userId AS Utf8;
                        UPDATE users
                        SET isActive = true
                        where id = $userId;`
        const paramsUpdate = {
            '$userId': TypedValues.utf8(resultCheck.data[0].userId)
        }
        result = await execute(query, paramsUpdate)
    }

    logger.info(`End Confirmation method. Result: ${JSON.stringify(result)}`)
    return result
}
