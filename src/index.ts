import {YC} from "./yc";
import {generatedEvent} from "./api/events/generated-event";
import {Result} from "./models/result";
import {getEvent} from "./api/events/getEvent";
import {getEvents} from "./api/events/getEvents";
import {addBot} from "./api/members/addBot";
import {logger} from "./db";
import {getMembers} from "./api/members/getMembers";
import {getProducts} from "./api/products/getProducts";
import {addProduct} from "./api/products/addProduct";
import {deleteProduct} from "./api/products/deleteProduct";
import {addEvent} from "./api/events/addEvent";
import {deleteEvent} from "./api/events/deleteEvent";
import {editEvent} from "./api/events/editEvent";

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
            break;
        case "add-event":
            result = await addEvent(event)
            break;
        case "edit-event":
            result = await editEvent(event)
            break;
        case "delete-event":
            result = await deleteEvent(event)
            break;
        case "add-bot-member":
            result = await addBot(event, logger)
            break
        case "get-members":
            result = await getMembers(event)
            break
        case "get-event-products":
            result = await getProducts(event)
            break
        case "add-product":
            result = await addProduct(event)
            break
        case "delete-product":
            result = await deleteProduct(event)
            break
    }

    return {
        statusCode: result.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: result.data,
        isBase64Encoded: false
    }
}
