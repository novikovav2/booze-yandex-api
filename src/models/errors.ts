import {MSG_INCORRECT_USER_OR_PASSWORD, MSG_TOKEN_NOT_CREATED} from "../consts";

type Severity = 'warning' | 'error'
interface Error {
    code: number,
    message: string,
    text: string,
    level: Severity
}
export const ERR_USER_EXIST: Error = {
    code: 100,
    message: 'User exist',
    text: 'Такой пользователь существует',
    level: "warning"
}

export const ERR_TOKEN_NOT_CREATED: Error = {
    code: 101,
    message: MSG_TOKEN_NOT_CREATED,
    text: MSG_TOKEN_NOT_CREATED,
    level: "error"
}

export const ERR_INCORRECT_USER_OR_PASSWORD: Error = {
    code: 102,
    message: MSG_INCORRECT_USER_OR_PASSWORD,
    text: MSG_INCORRECT_USER_OR_PASSWORD,
    level: "error"
}

export const ERR_NOT_AUTHORIZED: Error = {
    code: 103,
    message: 'You are not authorized to view event',
    text: 'Требуется авторизация, чтобы просмотреть событие',
    level: "warning"
}

export const ERR_MEMBER_BUY_PRODUCTS: Error = {
    code: 1000,
    message: "Member bought products",
    text: "Участник покупал продукты",
    level: "error"
}

export const ERR_EVENT_NOT_FOUND: Error = {
    code: 1001,
    message: 'Event not found',
    text: 'Событие не найдено',
    level: "error"
}

export const ERR_YOU_NOT_A_MEMBER: Error = {
    code: 1002,
    message: 'You are not a member',
    text: 'Вы не участник данного мероприятия',
    level: "warning"
}

export const ERR_ID_REQUIRED: Error = {
    code: 1003,
    message: 'ID required',
    text: 'Требуется указание ID',
    level: "error"
}

export const ERR_NEW_MEMBER_PAYLOAD: Error = {
    code: 1004,
    message: 'Require new member payload',
    text: 'Требуется указать данные о новом участнике',
    level: 'warning'
}
