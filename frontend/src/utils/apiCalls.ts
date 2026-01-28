import axios, { AxiosError } from 'axios'

export interface ExamDetails {
  examTitle: string;
  description: string;
  targetLanguage: string;
  topic: string;
  verbTenses: string[];
  vocabularyList: string;
  level: string;
  regionVariant?: string;
}

export interface ExamConfirm{
    id: string;
    title: string;
}

export interface ExamResponse {
    status: string;
    exam: ExamConfirm;
}


interface ApiError{
    detail: string;
}

export const createExam = async(examDetails: ExamDetails): Promise<ExamResponse> => {
    try{
        const res = await axios.post<ExamResponse>(
            `${import.meta.env.VITE_API_BASE_URL}exams`,
            examDetails,
            {withCredentials: true},
        )
        return res.data;

    } catch(err){
        if (axios.isAxiosError(err)){
            const axiosError = err as AxiosError<ApiError>;
            const message = axiosError.response?.data?.detail || "Exam creation failed";
            throw new Error(message);
        }

        if (err instanceof Error){
            throw new Error(err.message);
        }
        throw new Error("An unexpected error occured during exam creation.");
    }
} 