import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {EventNew} from "../../models/events";
import {TypedValues} from "ydb-sdk";
import {addCommonFund, removeCommonFund} from "./commonMoney";
import {SUCCESS} from "../../consts";

export const editEvent = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start editEvent method")
    let result: Result
    const id = event.params.id
    const newEvent: EventNew = JSON.parse(event.body)
    const query = ` DECLARE $id AS Utf8;
                    DECLARE $title AS Utf8;
                    DECLARE $eventedAt AS Utf8;
                    DECLARE $isPublic AS Bool;
                    DECLARE $reason AS Utf8;
                    DECLARE $status AS Utf8;
                    DECLARE $withCommonMoney AS Bool;
                    $parse1 = DateTime::Parse("%Y-%m-%dT%H:%M:%SZ");
                    UPSERT INTO events (id, title, evented_at, 
                        isPublic, reason, status, withCommonMoney )
                    VALUES ($id,  $title,
                    DateTime::MakeDatetime($parse1($eventedAt)) ,
                    $isPublic, $reason, $status, $withCommonMoney);`
    const params = {
        '$id': TypedValues.utf8(id),
        '$title': TypedValues.utf8(newEvent.title),
        '$eventedAt': TypedValues.utf8(newEvent.evented_at),
        '$isPublic': TypedValues.bool(newEvent.isPublic),
        '$reason': TypedValues.utf8(newEvent.reason),
        '$status': TypedValues.utf8(newEvent.status),
        '$withCommonMoney': TypedValues.bool(newEvent.withCommonMoney)
    }
    result = await execute(query, params)

    if (result.status === SUCCESS) {
        result = newEvent.withCommonMoney ? await addCommonFund(id) : await removeCommonFund(id)
    }

    logger.info(`End editEvent method. Result: ${JSON.stringify(result)}`)
    return result
}
