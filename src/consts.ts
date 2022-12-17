export const USER_BOT = 'bot'
export const USER_MAN = 'man'
export const USER_FUND = 'commonFund'
export const SUCCESS = 200
export const BAD_REQUEST = 400
export const NOT_FOUND = 404
export const UNAUTHORIZED = 401

export const MSG_INCORRECT_USER_OR_PASSWORD = 'User or Password are incorrect'
export const MSG_TOKEN_NOT_CREATED = 'Token not created'

export const MAIL_HOST = process.env.MAIL_HOST
export const MAIL_PORT = +process.env.MAIL_PORT
export const MAIL_USER = process.env.MAIL_USER
export const MAIL_PASS = process.env.MAIL_PASS
export const MAIL_FROM = process.env.MAIL_FROM
export const ENDPOINT = process.env.ENDPOINT
export const DATABASE = process.env.DATABASE

export const URL = process.env.URL
export const CONFIRMATION_URL = URL + '/auth/confirm'
export const NEW_PASSWORD_URL = URL + '/auth/newPassword'

export const SBJ_REGISTRATION = 'Добро пожаловать!'
export const SBJ_PASSWORD_RESET = 'Сброс пароля'

export const COMMON_FUND = 'Общий фонд'
