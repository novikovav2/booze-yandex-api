export type EVENT_STATUS = 'active' | 'archive'
export interface EventNew {
    title: string,
    reason: string,
    evented_at: Date,
    isPublic: boolean,
    status: EVENT_STATUS,
    authorId?: string
}
