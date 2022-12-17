import {YC} from "../../yc";
import {Result} from "../../models/result";
import {logger} from "../../db";
import {removeMember} from "../shared/removeMember";

export const deleteMember = async (event: YC.CloudFunctionsHttpEvent): Promise<Result> => {
    logger.info("Start deleteMember method")
    let result: Result
    const id = event.params.id          // member.id

    result = await  removeMember(id)

    logger.info(`End deleteMember method. Result: ${JSON.stringify(result)}`)
    return result
}
