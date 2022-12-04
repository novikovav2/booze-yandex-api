import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";
import {BAD_REQUEST, SUCCESS} from "../../consts";
import {Member} from "../../models/member";

export const getMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getMember method")
    let result: Result
    const id = event.params.id

    if (id) {
        const query = `select m.id as id,
                            m.eventId as eventId,
                            u.id as userId,
                            u.username as username,
                            u.type as type
                    from members m
                    cross join users u
                    where m.userId = u.id
                        and m.id = '${id}'`
        result = await execute(query)
        if (result.status === SUCCESS) {
            logger.info("Data received successfully")
            logger.info(`Data: ${JSON.stringify(result.data)}`)
            const member: Member = {
                id: result.data[0].id,
                eventId: result.data[0].eventId,
                user: {
                    id: result.data[0].userId,
                    username: result.data[0].username,
                    type: result.data[0].type
                }
            }
            result = {
                ...result,
                data: member
            }
        }
    } else {
        result = {
            status: BAD_REQUEST,
            data: {
                error: 'ID required'
            }
        }
    }

    logger.info(`End getMember method. Result: ${JSON.stringify(result)}`)
    return result
}
