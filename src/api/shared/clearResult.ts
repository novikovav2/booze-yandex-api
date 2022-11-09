import {execute} from "../../db";

export const clearResult = async (eventId: string) => {
    const query = `DELETE FROM results
                   WHERE eventId = '${eventId}'`
    return await execute(query)
}
