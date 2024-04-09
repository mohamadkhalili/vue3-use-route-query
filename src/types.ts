export type status = 'info' | 'success' | 'error' | 'warning'

export interface Snackbar {
    status: status,
    message: string,
    visible: boolean,
}