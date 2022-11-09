import {YC} from "../../yc";
import {Result} from "../../models/result";
import {execute, logger} from "../../db";
import {BAD_REQUEST} from "../../consts";
import {v4 as uuid} from "uuid"
import {User} from "../../models/user";
import {clearResult} from "../shared/clearResult";

export const joinMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start joinMember method")

    let result: Result
    const eventId: string = JSON.parse(event.body).eventId
    const user: User = event.requestContext.authorizer.user

    if (eventId && user.id) {
        const uuidMember = uuid()
        const query = `INSERT INTO members (id, eventId, userId)
                   VALUES ('${uuidMember}', '${eventId}', '${user.id}')`
        result = await execute(query)
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
