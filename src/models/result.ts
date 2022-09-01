export interface Result {
    status: number,
    message?: string,
    data?: any
}

export const RESULT_DEFAULT: Result = {
    status: 200,
    data: {}
}

export interface AuthResult {
    isAuthorized: boolean,
    context: Object
}
