import {Result} from "../../models/result";
import {YC} from "../../yc";
import {BAD_REQUEST, SUCCESS} from "../../consts";
import {execute, logger} from "../../db";
import {Member} from "../../models/member";
import {TypedValues} from "ydb-sdk";

export const getMembers = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getMembers method")
    let result: Result
    const id = event.params.id

    if (id) {
        const query = ` DECLARE $eventId AS Utf8;
                        SELECT m.id as id,
                            m.eventId as eventId,
                            m.money as money,
                            u.id as userId,
                            u.username as username,
                            u.type as type
                        FROM members VIEW EVENT_ID_IDX AS m
                        CROSS JOIN users u
                        WHERE m.userId = u.id
                            and m.eventId = $eventId
                        ORDER BY username;`
        const params = {
            '$eventId': TypedValues.utf8(id)
        }
        result = await execute(query, params)
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
    let result: Member[] = []
    data.forEach((item) => {
        const member: Member = {
            id: item.id,
            eventId: item.eventId,
            money: item.money,
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
