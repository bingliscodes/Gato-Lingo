
import axios, { AxiosError } from 'axios'

interface ApiError{
    detail: string;
}
export function getErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        return axiosError.response?.data?.detail || "Request failed";
    }
    if (err instanceof Error) {
        return err.message;
    }
    return "An unexpected error occurred";
}