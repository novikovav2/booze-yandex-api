import {YC} from "./yc";
import {generatedEvent} from "./api/generated-event";
import {Result} from "./models/result";
import {getEvent} from "./api/events/get";


export async function handler(event: YC.CloudFunctionsHttpEvent, context: YC.CloudFunctionsHttpContext) {
    let result: Result

    const api = event.requestContext.apiGateway.operationContext.api
    switch (api) {
        case "generated-event":
            result = await generatedEvent(event, context)
            break;
        case "get-event":
            result = await getEvent(event, context)
            break;
    }

    return {
        statusCode: result.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
            message: result.message,
            data: result.data
        },
        isBase64Encoded: false
    }
}
