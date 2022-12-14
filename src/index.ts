import {YC} from "./yc";
import {generatedEvent} from "./api/events/generated-event";
import {Result} from "./models/result";
import {getEvent} from "./api/events/getEvent";
import {getEvents} from "./api/events/getEvents";
import {addBot} from "./api/members/addBot";
import {getMembers} from "./api/members/getMembers";
import {getProducts} from "./api/products/getProducts";
import {addProduct} from "./api/products/addProduct";
import {deleteProduct} from "./api/products/deleteProduct";
import {addEvent} from "./api/events/addEvent";
import {deleteEvent} from "./api/events/deleteEvent";
import {editEvent} from "./api/events/editEvent";
import {deleteMember} from "./api/members/deleteMember";
import {getResult} from "./api/events/getResult";
import {getProduct} from "./api/products/getProduct";
import {editProduct} from "./api/products/editProduct";
import {editProfile} from "./api/auth/editProfile";
import {addUser} from "./api/auth/addUser";
import {login} from "./api/auth/login";
import {logout} from "./api/auth/logout";
import {authorization} from "./api/auth/authtorization";
import {joinMember} from "./api/members/joinMember";
import {getProfile} from "./api/auth/getProfile";
import {editPassword} from "./api/auth/editPassword";
import {confirmation} from "./api/auth/confirmation";
import {resetPassword} from "./api/auth/resetPassword";
import {newPassword} from "./api/auth/newPassword";
import {getMember} from "./api/members/getMember";
import {updateMember} from "./api/members/updateMember";
import {getProductsByMember} from "./api/products/getProductsByMember";
import {updateProductsByMember} from "./api/products/updateProductsByMember";
import {updateMembers} from "./api/members/updateMembers";

// context: YC.CloudFunctionsHttpContext
export async function handler(event: YC.CloudFunctionsHttpEvent) {
    let result: Result

    if (event.requestContext.apiGateway) {
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
            case "get-event-result":
                result = await getResult(event)
                break;
            case "add-bot-member":
                result = await addBot(event)
                break
            case "get-members":
                result = await getMembers(event)
                break
            case "get-member":
                result = await getMember(event)
                break
            case "delete-member":
                result = await deleteMember(event)
                break
            case "join-member":
                result = await joinMember(event)
                break
            case "update-member":
                result = await updateMember(event)
                break
            case "update-members":
                result = await updateMembers(event)
                break
            case "get-event-products":
                result = await getProducts(event)
                break
            case "get-product":
                result = await getProduct(event)
                break
            case "add-product":
                result = await addProduct(event)
                break
            case "delete-product":
                result = await deleteProduct(event)
                break
            case "edit-product":
                result = await editProduct(event)
                break
            case "get-products-by-member":
                result = await getProductsByMember(event)
                break
            case "update-products-by-member":
                result = await updateProductsByMember(event)
                break
            case "add-user":
                result = await addUser(event)
                break
            case "login":
                result = await login(event)
                break
            case "logout":
                result = await logout(event)
                break
            case "get-profile":
                result = await getProfile(event)
                break
            case "edit-profile":
                result = await editProfile(event)
                break
            case "edit-password":
                result = await editPassword(event)
                break
            case "resetPassword":
                result = await resetPassword(event)
                break
            case "newPassword":
                result = await newPassword(event)
                break
            case "confirmation":
                result = await confirmation(event)
                break
        }
        return {
            statusCode: result.status,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: result.data,
            isBase64Encoded: false
        }
    } else {
        return await authorization(event)
    }
}
