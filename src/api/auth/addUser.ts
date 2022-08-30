import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {Auth} from "../../models/auth";
import {hash} from "bcrypt";
import {v4 as uuid} from "uuid"
import {BAD_REQUEST, SUCCESS} from "../../consts";

export const addUser = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start addUser method")
    let result: Result
    const auth: Auth = JSON.parse(event.body)
    const queryCheckExistingUser = `SELECT id 
                                     FROM users
                                     WHERE email = '${auth.email}'`
    result = await execute(queryCheckExistingUser)
    if (result.status === SUCCESS && result.data.length > 0) {
        result = {
            status: BAD_REQUEST,
            data: {
                msg: 'User exist'
            }
        }
    } else if (result.status === SUCCESS && result.data.length === 0) {
        const hashPassword = await hash(auth.password,  6)
        const uuidNew = uuid()
        const query = `UPSERT INTO users (id, email, password, username, type)
                        VALUES ('${uuidNew}', '${auth.email}', '${hashPassword}',
                        '${auth.email}', 'man')`
        result = await execute(query)
    }

    logger.info(`End addUser method. Result: ${JSON.stringify(result)}`)
    return result
}
