import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {NewPassword} from "../../models/profile";
import {hash} from "bcrypt";

export const newPassword = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start newPassword method")
    let result: Result
    const password: NewPassword = JSON.parse(event.body)
    const hashPassword = await hash(password.password,  6)
    const query = `UPDATE users
                    SET password = '${hashPassword}'
                    WHERE id = '${password.userId}'`
    result = await execute(query)

    logger.info(`End newPassword method. Result: ${JSON.stringify(result)}`)
    return result
}
