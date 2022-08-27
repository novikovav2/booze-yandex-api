import {execute} from "../../db";
import {EVENT_STATUS} from "../../models/events";
import {v4 as uuid} from "uuid"
import {Result} from "../../models/result";
import {SUCCESS} from "../../consts";

export const generatedEvent = async (): Promise<Result> => {
    let result: Result

    const uuidUser = uuid()
    const queryCreateUser = `UPSERT INTO users (id, type) 
                            VALUES ('${uuidUser}', 'bot')`
    result = await execute(queryCreateUser)

    if (result.status === SUCCESS ) {
        const uuidEvent = uuid()
        const evented_at = `CurrentUtcDatetime()`
        const isPublic = true
        const reason = `Повод не нужен`
        const status: EVENT_STATUS = `active`
        const title = `Просто по пиву`
        const queryCreateEvent = `UPSERT INTO events (id, authorId, evented_at, isPublic, reason, status, title)
                                VALUES ('${uuidEvent}', '${uuidUser}', ${evented_at}, ${isPublic}, '${reason}', 
                                '${status}', '${title}')`

        result = await execute(queryCreateEvent)
        result = {
            ...result,
            data: {
                id: uuidEvent
            }
        }
    }
    return result
}
