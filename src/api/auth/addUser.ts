import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {Auth} from "../../models/auth";
import {hash} from "bcrypt";
import {v4 as uuid} from "uuid"
import {CONFIRMATION_URL, SBJ_REGISTRATION, SUCCESS, UNPROCESSABLE_ENTITY} from "../../consts";
import {mail} from "../../mail";
import {TypedValues} from "ydb-sdk";
import {ERR_USER_EXIST} from "../../models/errors";

export const addUser = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start addUser method")
    let result: Result
    const auth: Auth = JSON.parse(event.body)
    const queryCheckExistingUser = `DECLARE $email AS Utf8;
                                    SELECT id 
                                     FROM users VIEW EMAIL_IDX
                                     WHERE email = $email;`
    const paramsUser = {
        '$email': TypedValues.utf8(auth.email)
    }
    result = await execute(queryCheckExistingUser, paramsUser)
    if (result.status === SUCCESS && result.data.length > 0) {
        logger.info("User exist")
        result = {
            status: UNPROCESSABLE_ENTITY,
            data: ERR_USER_EXIST
        }
    } else if (result.status === SUCCESS && result.data.length === 0) {
        logger.info("User not exist")
        const hashPassword = await hash(auth.password,  6)
        const uuidNew = uuid()
        const query = ` DECLARE $id AS Utf8;
                        DECLARE $email AS Utf8;
                        DECLARE $password as Utf8;
                        DECLARE $username as Utf8;
                        DECLARE $type as Utf8;
                        DECLARE $isActive as Bool;
                        INSERT INTO users (id, email, password, username, 
                            type, isActive)
                        VALUES ($id, $email, $password, $username, $type, 
                                $isActive);`
        const paramsNewUser = {
            '$id': TypedValues.utf8(uuidNew),
            '$email': TypedValues.utf8(auth.email),
            '$password': TypedValues.utf8(hashPassword),
            '$username': TypedValues.utf8(auth.email),
            '$type': TypedValues.utf8('man'),
            '$isActive': TypedValues.bool(false),
        }
        result = await execute(query, paramsNewUser)

        if (result.status === SUCCESS) {
            logger.info("User successfully created")
            const uuidConfirm = uuid()
            const queryConfirm = `DECLARE $id AS Utf8;
                                  DECLARE $userId AS Utf8;
                                  INSERT INTO confirmations (id, userId, created_at)
                                  VALUES ($id, $userId, CurrentUtcDate());`
            const paramsConfirm = {
                '$id': TypedValues.utf8(uuidConfirm),
                '$userId': TypedValues.utf8(uuidNew)
            }
            const resConfirm = await execute(queryConfirm, paramsConfirm)
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
