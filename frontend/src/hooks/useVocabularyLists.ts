import {useState, useEffect} from 'react';
import { getCreatedVocabularyLists, type VocabularyListResponse } from '@/utils/apiCalls';

export function useVocabularyLists(){
    const [vocabLists, setVocabLists] = useState<VocabularyListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        setIsLoading(true);
        try{
            const data = await getCreatedVocabularyLists();
            setVocabLists(data);
            setError(null)
        }catch(err){
            if(err instanceof Error){
                setError(err.message);
            }
        }finally{
                setIsLoading(false);
            }
    };

    useEffect(() => {
        refresh();
    }, []);

    return {vocabLists, isLoading, error, refresh};
}