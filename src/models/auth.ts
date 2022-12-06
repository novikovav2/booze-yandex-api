export interface Auth {
    email: string,
    password: string
}

export interface Token {
    id: string,
    created_at: string,
    ttl: number, // Время жизни в секундах,
    userId: string
}

export interface ConfirmationData {
    confirmationId: string
}

export interface ResetPassword {
    email: string
}
