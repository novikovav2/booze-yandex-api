export type EVENT_STATUS = 'active' | 'archive'
export interface EventNew {
    title: string,
    reason: string,
    evented_at: string,
    isPublic: boolean,
    status: EVENT_STATUS,
    authorId?: string,
    withCommonMoney: boolean
}

export interface Event extends EventNew{
    id: string
}
