import {execute} from "../../db";
import {EVENT_STATUS} from "../../models/events";
import {v4 as uuid} from "uuid"
import {Result} from "../../models/result";
import {SUCCESS} from "../../consts";
import {TypedValues} from "ydb-sdk";
import {USER_TYPE} from "../../models/user";

export const generatedEvent = async (): Promise<Result> => {
    let result: Result

    const uuidUser = uuid()
    const typeUser:USER_TYPE = 'bot'
    const queryCreateUser = `DECLARE $id AS Utf8;
                             DECLARE $type AS Utf8;
                            UPSERT INTO users (id, type) 
                            VALUES ($id, $type);`
    const paramsUser = {
        '$id': TypedValues.utf8(uuidUser),
        '$type': TypedValues.utf8(typeUser)
    }
    result = await execute(queryCreateUser, paramsUser)

    if (result.status === SUCCESS ) {
        const uuidEvent = uuid()
        const evented_at = `CurrentUtcDatetime()`
        const isPublic = true
        const reason = `Повод не нужен`
        const status: EVENT_STATUS = `active`
        const title = `Просто по пиву`
        const withCommonMoney = false
        const queryCreateEvent = `DECLARE $id AS Utf8;
                                  DECLARE $authorId AS UTF8;
                                  DECLARE $isPublic AS Bool;
                                  DECLARE $reason AS Utf8;
                                  DECLARE $status AS Utf8;
                                  DECLARE $title AS Utf8;
                                  DECLARE $withCommonMoney AS Bool;
                                INSERT INTO events (id, authorId, evented_at, 
                                    isPublic, reason, status, title, withCommonMoney)
                                VALUES ($id, $authorId, ${evented_at}, 
                                        $isPublic, $reason, $status, $title,
                                        $withCommonMoney);`

        const paramsEvent = {
            '$id': TypedValues.utf8(uuidEvent),
            '$authorId': TypedValues.utf8(uuidUser),
            '$isPublic': TypedValues.bool(isPublic),
            '$reason': TypedValues.utf8(reason),
            '$status': TypedValues.utf8(status),
            '$title': TypedValues.utf8(title),
            '$withCommonMoney': TypedValues.bool(withCommonMoney)
        }

        result = await execute(queryCreateEvent, paramsEvent)
        result = {
            ...result,
            data: {
                id: uuidEvent
            }
        }
    }
    return result
}
