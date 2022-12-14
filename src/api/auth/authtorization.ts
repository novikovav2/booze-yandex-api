import {YC} from "../../yc";
import {AuthResult} from "../../models/result";
import {execute, logger} from "../../db";
import {SUCCESS} from "../../consts";
import {User} from "../../models/user";
import {TypedValues} from "ydb-sdk";

export const authorization = async (event: YC.CloudFunctionsHttpEvent): Promise<AuthResult> => {
    logger.info("Start authorization method")
    let result: AuthResult = {
        isAuthorized: false,
        context: {}
    }
    const authHeader = event.headers.authorization || event.headers.Authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        if (token) {
            const query = ` DECLARE $token AS Utf8;
                            SELECT u.id as id,
                                    u.username as username,
                                    u.type as type 
                            FROM tokens VIEW USER_ID_IDX as t
                            CROSS JOIN users u
                            WHERE t.userId = u.id 
                                AND t.id = $token;`
            const params = {
                '$token': TypedValues.utf8(token)
            }
            const r = await execute(query, params)
            if (r.status === SUCCESS && r.data.length > 0) {
                const user: User = {
                    id: r.data[0].id,
                    username: r.data[0].username,
                    type: r.data[0].type
                }
                result = {
                    isAuthorized: true,
                    context: {
                        user,
                        token
                    }
                }
            }
        }
    }

    logger.info(`End authorization method. Result: ${JSON.stringify(result)}`)
    return result
}
