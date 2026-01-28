import axios, { AxiosError } from 'axios'


export interface ExamFormData {
    title: string;
    description?: string;
    target_language: string;
    difficulty_level: string;
    topic: string;
    tenses: string[];                    // Array of tense names
    vocabulary_list_manual: string;      // Comma-separated string from textarea
    cultural_context?: string;           
}

// What the API returns
export interface ExamResponse {
    id: string;
    title: string;
    description: string | null;
    target_language: string;
    difficulty_level: string;
    topic: string;
    tenses: string;                      // JSON string in DB
    vocabulary_list_manual: string | null;
    vocabulary_list_id: string | null;
    cultural_context: string | null;
    conversation_prompt: string;
    created_by_id: string;
    created_at: string;
}


interface ApiError{
    detail: string;
}

function getErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;
        return axiosError.response?.data?.detail || "Request failed";
    }
    if (err instanceof Error) {
        return err.message;
    }
    return "An unexpected error occurred";
}

export const createExam = async(formData: ExamFormData): Promise<ExamResponse> => {
    try{
        const requestData = {
            ...formData,
            tenses: JSON.stringify(formData.tenses)
        }

        const res = await axios.post<ExamResponse>(
            `${import.meta.env.VITE_API_BASE_URL}exams`,
            requestData,
            {withCredentials: true},
        )
        return res.data;

    } catch(err){
         throw new Error(getErrorMessage(err));
        }
} 