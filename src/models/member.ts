import {User} from "./user";

export interface NewMember {
    eventId: string,
    username?: string
}

export interface Member {
    id: string,
    eventId: string,
    user: User,
    money?: number
}
