import {USER_BOT, USER_FUND, USER_MAN} from "../consts";

export type USER_TYPE = typeof USER_MAN | typeof USER_BOT | typeof USER_FUND
export interface User {
    id: string,
    username: string,
    type: USER_TYPE,
    email? : string,
    password?: string
}
