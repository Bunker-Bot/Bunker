import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpdateSectionInput {
  content?: string;
  title?: string;
}

export function useUpdateProjectSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, projectId, input }: { sectionId: string; projectId: string; input: UpdateSectionInput }) => {
      return { sectionId, projectId, ...input };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-sections', variables.projectId] });
    },
  });
}

export default useUpdateProjectSection;
