import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {User} from "../../models/user";
import {NewPassword} from "../../models/profile";
import {hash} from "bcrypt";

export const editPassword = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editPassword method")
    let result: Result
    const user: User = event.requestContext.authorizer.user
    const password: NewPassword = JSON.parse(event.body)
    const hashPassword = await hash(password.password,  6)
    const query = `UPDATE users
                    SET password = '${hashPassword}'
                    WHERE id = '${user.id}'`
    result = await execute(query)

    logger.info(`End editPassword method. Result: ${JSON.stringify(result)}`)
    return result
}
