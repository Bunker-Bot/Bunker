import { useQuery } from '@tanstack/react-query';
import { TechnologyRepository } from '../../repositories/technology.repository';

export const technologyKeys = {
  all: ['technologies'] as const,
  popular: () => [...technologyKeys.all, 'popular'] as const,
  search: (query: string) => [...technologyKeys.all, 'search', query] as const,
};

export const usePopularTechnologies = () => {
  return useQuery({
    queryKey: technologyKeys.popular(),
    queryFn: () => TechnologyRepository.getPopularTechnologies(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useTechnologySuggestions = (query: string) => {
  return useQuery({
    queryKey: technologyKeys.search(query),
    queryFn: () => TechnologyRepository.searchTechnologies(query),
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });
};
