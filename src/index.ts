import {YC} from "./yc";
import {generatedEvent} from "./api/events/generated-event";
import {Result} from "./models/result";
import {getEvent} from "./api/events/getEvent";
import {getEvents} from "./api/events/getEvents";

// context: YC.CloudFunctionsHttpContext
export async function handler(event: YC.CloudFunctionsHttpEvent) {

    let result: Result

    const api = event.requestContext.apiGateway.operationContext.api
    switch (api) {
        case "generated-event":
            result = await generatedEvent()
            break;
        case "get-event":
            result = await getEvent(event)
            break;
        case "get-events":
            result = await getEvents(event)
    }

    return {
        statusCode: result.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: result.data,
        isBase64Encoded: false
    }
}
