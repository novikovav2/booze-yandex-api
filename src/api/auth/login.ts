import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {BAD_REQUEST, MSG_INCORRECT_USER_OR_PASSWORD, MSG_TOKEN_NOT_CREATED, SUCCESS} from "../../consts";
import {v4 as uuid} from "uuid"
import {Auth, Token} from "../../models/auth";
import {User, USER_TYPE} from "../../models/user";
import {compare} from "bcrypt";
import {TypedValues} from "ydb-sdk";

export const login = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start login method")
    let result: Result

    const auth: Auth = JSON.parse(event.body)
    const typeUser: USER_TYPE = 'man'
    const queryFromUsers = `DECLARE $email AS Utf8;
                            DECLARE $type AS Utf8;
                            SELECT id, password 
                            FROM users
                            WHERE type = $type AND isActive = true
                                AND email = $email;`
    const paramsAuth = {
        '$email': TypedValues.utf8(auth.email),
        '$type': TypedValues.utf8(typeUser)
    }
    result = await execute(queryFromUsers, paramsAuth)
    if (result.status === SUCCESS && result.data.length > 0) {
        const user: User = {
            id: result.data[0].id,
            username: '',
            type: 'man',
            email: auth.email,
            password: result.data[0].password
        }
        const passwordCorrect = await compare(auth.password, user.password)
        if (passwordCorrect) {
            const token = uuid()
            const created_at = (new Date()).toJSON()
            const queryCreateToken = `DECLARE $id AS Utf8;
                                      DECLARE $userId AS Utf8;
                                      DECLARE $createdAt as Utf8;
                                      $parse1 = DateTime::Parse("%Y-%m-%dT%H:%M:%SZ");
                                      UPSERT INTO tokens (id, userId, created_at)
                                      VALUES ($id, $userId, 
                                      DateTime::MakeDatetime($parse1($createdAt)));`
            const paramsToken = {
                '$id': TypedValues.utf8(token),
                '$userId': TypedValues.utf8(user.id),
                '$createdAt': TypedValues.utf8(created_at)
            }
            result = await execute(queryCreateToken, paramsToken)
            if (result.status === SUCCESS) {
                const resultToken: Token = {
                    id: token,
                    created_at,
                    ttl: 604800, // в секундах === 7 дней
                    userId: user.id
                }
                result = {
                    ...result,
                    data: resultToken
                }
            } else {
                result = {
                    status: BAD_REQUEST,
                    data: { msg: MSG_TOKEN_NOT_CREATED }
                }
            }

        } else {
            result = {
                status: BAD_REQUEST,
                data: { msg: MSG_INCORRECT_USER_OR_PASSWORD }
            }
        }
    } else if (result.status === SUCCESS && result.data.length === 0) {
        result = {
            status: BAD_REQUEST,
            data: { msg: MSG_INCORRECT_USER_OR_PASSWORD }
        }
    }

    logger.info(`End login method. Result: ${JSON.stringify(result)}`)
    return result
}
