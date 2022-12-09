export type USER_TYPE = 'man' | 'bot'
export interface User {
    id: string,
    username: string,
    type: USER_TYPE,
    email? : string,
    password?: string
}
