import {Result} from "../../models/result";
import {YC} from "../../yc";

export const getEvent = async (event: YC.CloudFunctionsHttpEvent,
                               context: YC.CloudFunctionsHttpContext): Promise<Result> => {
    let result: Result
    const id = event.params.id
    result = {
        status: 200,
        message: "TEST",
        data: id
    }


    return result
}
