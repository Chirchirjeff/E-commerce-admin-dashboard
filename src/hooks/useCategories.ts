import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI, MarketplaceCategory } from '@/lib/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesAPI.getAll(true);
      return response.data;
    },
  });
};

export const useCategoriesFlat = () => {
  return useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const response = await categoriesAPI.getAll(false);
      return response.data;
    },
  });
};

export const useCategoryById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await categoriesAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCategoryBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['category-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await categoriesAPI.getBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
  });
};

export const useCategoryBreadcrumb = (id: string | undefined) => {
  return useQuery({
    queryKey: ['category-breadcrumb', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await categoriesAPI.getBreadcrumb(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
    },
  });
};

export const useDeactivateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesAPI.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useActivateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesAPI.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
