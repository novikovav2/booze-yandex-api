import {YC} from "../../yc";
import {Result} from "../../models/result";
import {NewMember} from "../../models/member";
import {v4 as uuid} from "uuid"
import {execute} from "../../db";
import {SUCCESS} from "../../consts";

export const addBot = async (event: YC.CloudFunctionsHttpEvent,
                             logger: any): Promise<Result> => {
    logger.info("Start addBot method")

    let result: Result
    const member: NewMember = JSON.parse(event.body)
    const uuidBot = uuid()

    const queryCreateBot = `UPSERT INTO users (id, type, username)
                           VALUES ('${uuidBot}', 'bot', '${member.username}')`
    result = await execute(queryCreateBot)

    if (result.status === SUCCESS) {
        const uuidMember = uuid()
        const queryAddBotToEvent = `UPSERT INTO members (id, eventId, userId)
                                    VALUES ('${uuidMember}', '${member.eventId}', '${uuidBot}')`
        result = await execute(queryAddBotToEvent)
    }
    logger.info(`End addBot method. Result: ${JSON.stringify(result)}`)
    return result
}
