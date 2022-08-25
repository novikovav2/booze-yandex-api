import {Result} from "../../models/result";
import {YC} from "../../yc";
import {BAD_REQUEST, SUCCESS} from "../../consts";
import {execute, logger} from "../../db";

export const getMembers = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getMembers method")
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
                        and m.eventId = '${id}'`
        result = await execute(query)
        if (result.status === SUCCESS) {
            logger.info("Data received successfully")
            logger.info(`Data: ${JSON.stringify(result.data)}`)
            result = {
                ...result,
                data: parseMembers(result.data)
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
    logger.info(`End getMembers method. Result: ${JSON.stringify(result)}`)
    return result
}

const parseMembers = (data: any[]) => {
    interface Member {
        id: string,
        eventId: string,
        user: {
            id: string,
            username: string,
            type: string
        }
    }
    let result: Member[] = []
    data.forEach((item) => {
        const member: Member = {
            id: item.id,
            eventId: item.eventId,
            user: {
                id: item.userId,
                username: item.username,
                type: item.type
            }
        }
        result.push(member)
    })
    return result
}
