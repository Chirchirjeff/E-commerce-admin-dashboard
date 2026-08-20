import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsAPI, SellerTag } from '@/lib/api';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await tagsAPI.getAll();
      return response.data;
    },
  });
};

export const useTagById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tag', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await tagsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useTagBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['tag-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await tagsAPI.getBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
  });
};

export const useSearchTags = (query: string | undefined) => {
  return useQuery({
    queryKey: ['tags-search', query],
    queryFn: async () => {
      if (!query || query.length < 1) return [];
      const response = await tagsAPI.search(query);
      return response.data;
    },
    enabled: !!query && query.length > 0,
  });
};

export const useTaggedProducts = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tagged-products', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await tagsAPI.getTaggedProducts(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useProductTags = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product-tags', productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = await tagsAPI.getProductTags(productId);
      return response.data;
    },
    enabled: !!productId,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tagsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      tagsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tagsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useAddTagToProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, productId }: { tagId: string; productId: string }) =>
      tagsAPI.addToProduct(tagId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useRemoveTagFromProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tagId, productId }: { tagId: string; productId: string }) =>
      tagsAPI.removeFromProduct(tagId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useAddTagsToProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, tagIds }: { productId: string; tagIds: string[] }) =>
      tagsAPI.addTagsToProduct(productId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
