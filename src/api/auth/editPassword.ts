import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {User} from "../../models/user";
import {NewPassword} from "../../models/profile";
import {hash} from "bcrypt";
import {TypedValues} from "ydb-sdk";

export const editPassword = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editPassword method")
    let result: Result
    const user: User = event.requestContext.authorizer.user
    const password: NewPassword = JSON.parse(event.body)
    const hashPassword = await hash(password.password,  6)
    const query = `DECLARE $password AS Utf8;
                    DECLARE $userId as Utf8;
                    UPDATE users
                    SET password = $password
                    WHERE id = $userId;`
    const params = {
        '$password': TypedValues.utf8(hashPassword),
        '$userId': TypedValues.utf8(user.id)
    }
    result = await execute(query, params)

    logger.info(`End editPassword method. Result: ${JSON.stringify(result)}`)
    return result
}
