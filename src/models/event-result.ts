import {User} from "./user";

export interface Payment {
    recipient: User,
    value: number
}

export interface Donor {
    user: User,
    payments: Payment[],
    totalAte?: number,
    currentAte?: number
}

export interface Recipient {
    user: User,
    totalPaid?: number,
    currentPaid?: number
}

export interface EventResult {
    eventId: string,
    recipients: Recipient[],
    donors: Donor[]
}
