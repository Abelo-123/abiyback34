import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api';

export function useCategories(platform: string) {
    return useQuery<string[]>({
        queryKey: ['categories', platform],
        queryFn: () => getCategories(platform),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}
