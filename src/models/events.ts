export type EVENT_STATUS = 'active' | 'archive'
export interface EventNew {
    title: string,
    reason: string,
    evented_at: Date,
    isPublic: boolean,
    status: EVENT_STATUS,
    authorId?: string
}

export interface Event {
    id: string,
    title: string,
    reason: string,
    evented_at: string,
    isPublic: boolean,
    status: EVENT_STATUS,
    authorId?: string
}
