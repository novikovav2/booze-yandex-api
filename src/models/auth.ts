export interface Auth {
    email: string,
    password: string
}

export interface Token {
    token: string,
    created_at: string,
    ttl: number // Время жизни в секундах
}

export interface ConfirmationData {
    confirmationId: string
}
