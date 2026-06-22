import { useQuery } from '@tanstack/react-query';
import { getServicesByCategory } from '../api';
import type { Service } from '../types';

export function useCategoryServices(category?: string, ids?: number[]) {
    return useQuery<Service[]>({
        queryKey: ['services', 'category', category, ids?.join(',')],
        queryFn: async () => {
            const data = await getServicesByCategory(
                category === 'Top Services' ? undefined : category,
                category === 'Top Services' ? ids : undefined
            );
            
            // Transform the Node.js API response to the format used by the frontend
            return data.map((s: any) => ({
                id: s.service || s.id,
                category: s.category,
                name: s.name,
                type: s.type,
                rate: parseFloat(s.rate),
                min: s.min,
                max: s.max,
                averageTime: s.average_time || s.averageTime || '',
                refill: s.refill,
                cancel: s.cancel,
            }));
        },
        enabled: !!category || !!(ids && ids.length > 0),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}
