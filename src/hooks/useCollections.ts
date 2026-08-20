import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsAPI, SellerCollection } from '@/lib/api';

export const useCollections = (includeInactive?: boolean) => {
  return useQuery({
    queryKey: ['collections', includeInactive],
    queryFn: async () => {
      const response = await collectionsAPI.getAll(includeInactive);
      return response.data;
    },
  });
};

export const useCollectionById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await collectionsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCollectionProducts = (id: string | undefined) => {
  return useQuery({
    queryKey: ['collection-products', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await collectionsAPI.getProducts(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collectionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      collectionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useDeactivateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collectionsAPI.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useActivateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collectionsAPI.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collectionsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useAddProductToCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, productId }: { collectionId: string; productId: string }) =>
      collectionsAPI.addProduct(collectionId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};

export const useRemoveProductFromCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, productId }: { collectionId: string; productId: string }) =>
      collectionsAPI.removeProduct(collectionId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};
