import {Result} from "../../models/result";
import {YC} from "../../yc";
import {execute, logger} from "../../db";
import {NOT_FOUND, SUCCESS, UNAUTHORIZED} from "../../consts";
import {Event} from "../../models/events"
import {TypedValues} from "ydb-sdk";

export const getEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start getEvent method")
    let result: Result
    let query: string
    let eventResult: Event
    const id = event.params.id
    query = `DECLARE $id AS Utf8;
             SELECT id,  
                   evented_at, 
                    isPublic, reason, status, title, withCommonMoney
             FROM events
             WHERE id = $id;`
    const params = {
        '$id': TypedValues.utf8(id)
    }
    result = await execute(query, params)
    if (result.status === SUCCESS) {
        if (result.data.length > 0) {          // Мероприятие найдено
            logger.info("Event found")
            eventResult = {
                id: result.data[0].id,
                title: result.data[0].title,
                isPublic: result.data[0].isPublic,
                status: result.data[0].status,
                evented_at: (new Date(result.data[0].evented_at * 1000)).toISOString(),
                reason: result.data[0].reason,
                withCommonMoney: result.data[0].withCommonMoney
            }
            if (result.data[0].isPublic ) {     // Открытое мероприятие доступно всем
                logger.info("Event is public")
                result = {
                    status: SUCCESS,
                    data: { ...eventResult }
                }
            } else {                            // Закрытое мероприятие нужно быть учатсником
                logger.info("Event is not public")
                result = {
                    status: UNAUTHORIZED,
                    data: {message: 'You are not authorized to view event'}
                }
                const authHeader = event.headers.authorization || event.headers.Authorization
                if (authHeader) {
                    logger.info("Authorization header found")
                    const token = authHeader.split(' ')[1]
                    if (token) {
                        logger.info("Token found")
                        const queryUser = ` DECLARE $tokenId AS Utf8;
                                            SELECT u.id as id
                                            FROM tokens VIEW USER_ID_IDX as t
                                            CROSS JOIN users u
                                            WHERE t.userId = u.id 
                                                AND t.id = $tokenId;`
                        const paramsToken = {
                            '$tokenId': TypedValues.utf8(token)
                        }
                        const r = await execute(queryUser, paramsToken)
                        if (r.status === SUCCESS && r.data.length > 0) {
                            logger.info("User found")
                            const userId = r.data[0].id // Авторизация пройдена
                            const queryMember = ` DECLARE $userId AS Utf8;
                                                  DECLARE $eventId AS UTF8;
                                                  SELECT id, 
                                                  FROM members VIEW EVENT_ID_IDX
                                                  WHERE userId = $userId 
                                                  AND eventId = $eventId;`
                            const paramsMember = {
                                '$userId': TypedValues.utf8(userId),
                                '$eventId': TypedValues.utf8(id)
                            }
                            const resMember = await execute(queryMember, paramsMember)
                            if (resMember.status === SUCCESS && resMember.data.length > 0) {
                                // Пользователь участник мероприятия
                                logger.info("User is a member of event")
                                result = {
                                    status: SUCCESS,
                                    data: { ...eventResult }
                                }
                            } else {
                                // Пользователь не участник мероприятия
                                logger.info("user are not a member of event")
                                result = {
                                    status: UNAUTHORIZED,
                                    data: {message: 'You are not a member'}
                                }
                            }
                        }
                    }
                }
            }
        } else {
            logger.info("Event not found")
            result = {
                status: NOT_FOUND,
                data: {message: 'Event not found'}
            }
        }

    }

    logger.info(`End getEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
