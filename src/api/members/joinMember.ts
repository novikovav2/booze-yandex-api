import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {BAD_REQUEST} from "../../consts";
import {v4 as uuid} from "uuid"
import {User} from "../../models/user";
import {clearResult} from "../shared/clearResult";
import {TypedValues} from "ydb-sdk";

export const joinMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start joinMember method")

    let result: Result
    const eventId: string = JSON.parse(event.body).eventId
    const user: User = event.requestContext.authorizer.user

    if (eventId && user.id) {
        const uuidMember = uuid()
        const query = ` DECLARE $memberId AS Utf8;
                        DECLARE $eventId AS Utf8;
                        DECLARE $userId AS Utf8;
                        INSERT INTO members (id, eventId, userId)
                        VALUES ($memberId, $eventId, $userId);`
        const params = {
            '$memberId': TypedValues.utf8(uuidMember),
            '$eventId': TypedValues.utf8(eventId),
            '$userId': TypedValues.utf8(user.id),
        }
        result = await execute(query, params)
        await clearResult(eventId)
    } else {
        result = {
            status: BAD_REQUEST,
            data: { message: "Require new member payload" }
        }
    }

    logger.info(`End joinMember method. Result: ${JSON.stringify(result)}`)
    return result
}
