import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {Auth} from "../../models/auth";
import {hash} from "bcrypt";
import {v4 as uuid} from "uuid"
import {BAD_REQUEST, CONFIRMATION_URL, SBJ_REGISTRATION, SUCCESS} from "../../consts";
import {mail} from "../../mail";

export const addUser = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start addUser method")
    let result: Result
    const auth: Auth = JSON.parse(event.body)
    const queryCheckExistingUser = `SELECT id 
                                     FROM users
                                     WHERE email = '${auth.email}'`
    result = await execute(queryCheckExistingUser)
    if (result.status === SUCCESS && result.data.length > 0) {
        logger.info("User exist")
        result = {
            status: BAD_REQUEST,
            data: {
                msg: 'User exist'
            }
        }
    } else if (result.status === SUCCESS && result.data.length === 0) {
        logger.info("User not exist")
        const hashPassword = await hash(auth.password,  6)
        const uuidNew = uuid()
        const query = `UPSERT INTO users (id, email, password, username, type, isActive)
                        VALUES ('${uuidNew}', '${auth.email}', '${hashPassword}',
                        '${auth.email}', 'man', false)`
        result = await execute(query)

        if (result.status === SUCCESS) {
            logger.info("User successfully created")
            const uuidConfirm = uuid()
            const queryConfirm = `UPSERT INTO confirmations (id, userId, created_at)
                                  VALUES ('${uuidConfirm}', '${uuidNew}', CurrentUtcDate())`
            const resConfirm = await execute(queryConfirm)
            if (resConfirm.status === SUCCESS) {
                logger.info("Confirmation successfully created")
                const confirmationUrl = CONFIRMATION_URL + '/' + uuidConfirm
                const textEmail = `Добро пожаловать в Разделялку!
                           Чтобы закончить регистрацию надо пройти по ссылке:
                           ${confirmationUrl}`
                const htmlEmail = `<h3>Добро пожаловать в Разделялку!</h3>
                            <p>Чтобы закончить регистрацию пройдите по ссылке:</p>
                            <a href="${confirmationUrl}">${confirmationUrl}</a>`
                await mail(auth.email, SBJ_REGISTRATION, textEmail, htmlEmail)
            }
        }
    }

    logger.info(`End addUser method. Result: ${JSON.stringify(result)}`)
    return result
}
