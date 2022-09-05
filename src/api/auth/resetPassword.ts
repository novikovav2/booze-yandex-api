import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {ResetPassword} from "../../models/auth";
import {NEW_PASSWORD_URL, SBJ_PASSWORD_RESET, SUCCESS} from "../../consts";
import {mail} from "../../mail";

export const resetPassword = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start resetPassword method")
    let result: Result
    const data: ResetPassword = JSON.parse(event.body)
    const query = `SELECT id, username
                    FROM users
                    WHERE email = '${data.email}'`
    result = await execute(query)
    if (result.status === SUCCESS && result.data.length > 0) {
        logger.info("User found")
        const url = NEW_PASSWORD_URL + '/' + result.data[0].id
        const text = `Уважаемый, ${result.data[0].username}.
                      Для сброса пароля пройди по ссылке:
                      ${url}`
        const html = `<h3>Уважаемый, ${result.data[0].username}</h3>
                        <p>Для сброса пароля пройди по ссылке:</p>
                        <a href="${url}">${url}</a>`
        await mail(data.email, SBJ_PASSWORD_RESET, text, html)
    }

    logger.info(`End resetPassword method. Result: ${JSON.stringify(result)}`)
    return result
}
