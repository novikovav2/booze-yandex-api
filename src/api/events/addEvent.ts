import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {v4 as uuid} from "uuid"
import {EventNew} from "../../models/events";
import {SUCCESS} from "../../consts";
import {User} from "../../models/user";
import {TypedValues} from "ydb-sdk";

export const addEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start addEvent method")
    let result: Result
    const newEvent: EventNew = JSON.parse(event.body)
    const uuidEvent = uuid()
    const user: User = event.requestContext.authorizer.user

    const query = ` DECLARE $id AS Utf8;
                    DECLARE $eventedAt AS Utf8;
                    DECLARE $isPublic AS Bool;
                    DECLARE $reason AS Utf8;
                    DECLARE $status AS Utf8;
                    DECLARE $title AS Utf8;
                    DECLARE $withCommonMoney AS Bool;
                    $parse1 = DateTime::Parse("%Y-%m-%dT%H:%M:%SZ");
                    INSERT INTO events (id, evented_at, isPublic, 
                            reason, status, title, withCommonMoney)
                    VALUES ($id, DateTime::MakeDatetime($parse1($eventedAt)),
                    $isPublic, $reason, $status, $title, $withCommonMoney);`
    const paramsEvent = {
        '$id': TypedValues.utf8(uuidEvent),
        '$eventedAt': TypedValues.utf8(newEvent.evented_at),
        '$isPublic': TypedValues.bool(newEvent.isPublic),
        '$reason': TypedValues.utf8(newEvent.reason),
        '$status': TypedValues.utf8(newEvent.status),
        '$title': TypedValues.utf8(newEvent.title),
        '$withCommonMoney': TypedValues.bool(newEvent.withCommonMoney),
    }
    result = await execute(query, paramsEvent)
    if (result.status === SUCCESS) {
        const uuidMember = uuid()
        const queryAddMember = `DECLARE $id AS Utf8;
                                DECLARE $eventId AS Utf8;
                                DECLARE $userId AS Utf8;
                                UPSERT INTO members (id, eventId, userId)
                                VALUES ($id, $eventId, $userId);`
        const paramsMember = {
            '$id': TypedValues.utf8(uuidMember),
            '$eventId': TypedValues.utf8(uuidEvent),
            '$userId': TypedValues.utf8(user.id),
        }
        await execute(queryAddMember, paramsMember)
        result = {
            ...result,
            data: { id: uuidEvent }
        }
    }

    logger.info(`End addEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
