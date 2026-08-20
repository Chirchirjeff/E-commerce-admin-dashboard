'use client';

import React from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useCollections } from '@/hooks/useCollections';
import { useTags } from '@/hooks/useTags';
import { MarketplaceCategory, SellerCollection, SellerTag } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ChevronRight, Tag, FolderOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CategoriesPanel() {
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: collections, isLoading: isLoadingCollections } = useCollections();
  const { data: tags, isLoading: isLoadingTags } = useTags();
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderCategoryTree = (cats?: MarketplaceCategory[], depth = 0): React.ReactNode => {
    if (!cats || cats.length === 0) return null;

    return (
      <div>
        {cats.map(cat => {
          const hasChildren = cat.children && cat.children.length > 0;
          const isExpanded = expandedIds.has(cat.id);

          return (
            <div key={cat.id}>
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                  !cat.isActive && 'opacity-50'
                )}
                style={{ marginLeft: `${depth * 16}px` }}
              >
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(cat.id)}
                    className="flex-shrink-0"
                  >
                    <ChevronRight
                      size={16}
                      className={cn(
                        'transition-transform',
                        isExpanded && 'rotate-90'
                      )}
                    />
                  </button>
                ) : (
                  <div className="w-4" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{cat.name}</div>
                  {cat.description && (
                    <div className="text-xs text-gray-500 truncate">{cat.description}</div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {cat._count?.products && (
                    <Badge variant="secondary" className="text-xs">
                      {cat._count.products} products
                    </Badge>
                  )}
                  {!cat.isActive && (
                    <Badge variant="destructive" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              {isExpanded && renderCategoryTree(cat.children, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Layers size={16} />
            <span>Marketplace Categories</span>
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <FolderOpen size={16} />
            <span>My Collections</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag size={16} />
            <span>My Tags</span>
          </TabsTrigger>
        </TabsList>

        {/* Marketplace Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Categories</CardTitle>
              <CardDescription>
                Platform-controlled product taxonomy. Select from these categories when creating products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  {renderCategoryTree(categories)}
                </div>
              ) : (
                <div className="text-center text-gray-500 p-8">
                  No categories available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Collections</CardTitle>
              <CardDescription>
                Create and manage custom product groupings for your store.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCollections ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : collections && collections.length > 0 ? (
                <div className="grid gap-3">
                  {collections.map(collection => (
                    <div
                      key={collection.id}
                      className={cn(
                        'flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors',
                        !collection.isActive && 'opacity-50'
                      )}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{collection.name}</div>
                        {collection.description && (
                          <div className="text-sm text-gray-500 truncate">{collection.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        {collection._count?.products && (
                          <Badge variant="secondary" className="text-xs">
                            {collection._count.products} products
                          </Badge>
                        )}
                        {!collection.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 p-8">
                  No collections yet. Create one to organize your products!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Tags</CardTitle>
              <CardDescription>
                Create and manage custom labels for your products.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTags ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : tags && tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 px-3 py-1 rounded-full border"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : undefined,
                        borderColor: tag.color || undefined,
                      }}
                    >
                      <Tag size={14} />
                      <span className="text-sm font-medium">{tag.name}</span>
                      {tag._count?.products && (
                        <span className="text-xs text-gray-500">({tag._count.products})</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 p-8">
                  No tags yet. Create some to label your products!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
