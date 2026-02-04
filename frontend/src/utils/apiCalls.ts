import axios from 'axios';
import { getErrorMessage } from "./helperFunctions";


export interface ExamFormData {
    title: string;
    description: string;
    target_language: string;
    difficulty_level: string;
    topic: string;
    tenses: string[];                    // Array of tense names
    vocabulary_list_manual: string;      // Comma-separated string from textarea
    cultural_context: string | null;           
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

export interface SessionScoreResponse {
    id: string;
    vocabulary_usage_score: number;
    grammar_accuracy_score: number; 
    verb_tense_accuracy_score: number,
    fluency_score: number;
    overall_score: number; 
    vocabulary_used: string | null;
    vocabulary_missed: string | null;
    grammar_feedback: string | null;
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

type SessionStatus = "assigned" | "in_progress" | "completed";

export interface ConversationSession {
    id: string;
    status: SessionStatus;
    due_date: string | null;
    started_at: string | null
    ended_at: string | null
    created_at: string | null
    exam_id: string | null;
    student_id: string | null
    session_score: SessionScoreResponse | null;
}

export interface DashboardExamResponse {
    exam: ExamResponse;
    total_assigned: number;
    pending: number;
    in_progress: number;
    completed: number;
    sessions: ConversationSession [];
}

export const getCreatedExams = async(): Promise<DashboardExamResponse[]> => {
    try {
        const res = await axios.get<DashboardExamResponse[]>(
            `${import.meta.env.VITE_API_BASE_URL}exams/dashboard`,
            {withCredentials: true}
        );
        return res.data;
    }catch(err){
         throw new Error(getErrorMessage(err));
        }
}

export interface StudentResponse {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export const getStudents = async (): Promise<StudentResponse[]> => {
    try {
        const res = await axios.get<StudentResponse[]>(
            `${import.meta.env.VITE_API_BASE_URL}users/my-students`,
            { withCredentials: true }
        );
        return res.data;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            // Log the full error response
            console.error("Status:", err.response?.status);
            console.error("Data:", err.response?.data);
            console.error("Headers:", err.response?.headers);
        }
        throw new Error(getErrorMessage(err));
    }
};

export interface ExamAssignmentRequest {
  exam_id: string;
  student_ids: string[];
  due_date: string | null;
}

export const assignExamToStudents = async (examAssignmentRequest: ExamAssignmentRequest): Promise<ConversationSession[]> => {
    try{
        const res = await axios.post<ConversationSession[]>(
            `${import.meta.env.VITE_API_BASE_URL}exams/assign`,
            examAssignmentRequest,
            {withCredentials: true},
        )
        return res.data;
    }
   catch(err){
         throw new Error(getErrorMessage(err));
        }

}

export interface StudentAssignmentResponse {
    id: string;
    status: SessionStatus;
    due_date: string | null;
    started_at: string | null;
    ended_at: string | null;
    created_at: string;
    student_id: string | null;
    exam: ExamResponse;
    session_score: SessionScoreResponse | null;
} 

export const getMyAssignments = async (): Promise<StudentAssignmentResponse[]> => {
    try{
        const res = await axios.get<StudentAssignmentResponse[]>(
            `${import.meta.env.VITE_API_BASE_URL}exams/assignments`,
            {withCredentials: true}
        )
        return res.data;
    }catch (err){
        throw new Error(getErrorMessage(err));
    }
}

export interface ExamScoreSummary {
    session_id: string;
    student_name: string;
    status: SessionStatus;
    completed_at: string;
    score: SessionScoreResponse
}

export interface ExamScoresResponse {
    exam: ExamResponse;
    sessions: ExamScoreSummary [];
} 

export const getExamScores = async(examId: string | undefined): Promise<ExamScoresResponse> => {
    try{
        const res = await axios.get<ExamScoresResponse>(
            `${import.meta.env.VITE_API_BASE_URL}exams/${examId}/scores`,
            {withCredentials: true}
        )
        return res.data;
    } catch(err){
        throw new Error(getErrorMessage(err));
    }
}

export interface VocabItem {
  word: string;
  translation: string;
  part_of_speech: string | null;
  example_sentence: string | null;
  regional_notes: string | null;
}

export interface VocabularyListResponse{
    id: string;
    title: string;
    description: string | null;
    target_language: string | null;
    teacher_id: string | null;
    items: VocabItem[] | null;
}

export interface VocabularyListPreviewCreate{
    file: File
}

export interface VocabularyListPreviewResponse{
    items: VocabItem[];
    total: number;
    errors: string[];
}

interface VocabListCreate{
    title: string;
    description: string | null;
    target_language: string | null;
    items: VocabItem[];
}

export const previewVocabularyList = async(formData: VocabularyListPreviewCreate): Promise<VocabularyListPreviewResponse> => {
    try{
        const res = await axios.post<VocabularyListPreviewResponse>(
            `${import.meta.env.VITE_API_BASE_URL}vocabulary-lists/preview`,
            formData,
            {withCredentials: true}
        )
        return res.data;
    }catch(err){
        throw new Error(getErrorMessage(err));
    }
}

export const createVocabularyList = async(vocabListData: VocabListCreate): Promise<VocabularyListResponse> => {
    try{
        const res = await axios.post<VocabularyListResponse>(
            `${import.meta.env.VITE_API_BASE_URL}vocabulary-lists/save`,
            vocabListData,
            {withCredentials: true}
        )
        return res.data;
    }catch(err){
        throw new Error(getErrorMessage(err));
    }
}

export const getCreatedVocabularyLists = async(): Promise<VocabularyListResponse[]> => {
    try{
        const res = await axios.get<VocabularyListResponse[]>(
            `${import.meta.env.VITE_API_BASE_URL}vocabulary-lists`,
            {withCredentials: true}
        )
        return res.data;
    }catch(err){
        throw new Error(getErrorMessage(err));
    }
}