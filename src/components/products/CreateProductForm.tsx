'use client';

import React, { useState } from 'react';
import { useCategories, useCategoryById } from '@/hooks/useCategories';
import { useCollections } from '@/hooks/useCollections';
import { useTags, useSearchTags } from '@/hooks/useTags';
import { productsAPI, MarketplaceCategory, CategoryAttribute } from '@/lib/api';
import { CategorySelector } from '@/components/categories/CategorySelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CreateProductForm() {
  const { data: collections } = useCollections();
  const { data: tags } = useTags();
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null);
  const { data: categoryDetails } = useCategoryById(selectedCategory?.id);
  const [searchTagQuery, setSearchTagQuery] = useState('');
  const { data: searchResults } = useSearchTags(searchTagQuery);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    thumbnailUrl: '',
    attributeValues: {} as Record<string, string>,
    selectedCollections: [] as string[],
    selectedTags: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttributeChange = (attributeId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributeValues: {
        ...prev.attributeValues,
        [attributeId]: value,
      },
    }));
  };

  const handleToggleCollection = (collectionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCollections: prev.selectedCollections.includes(collectionId)
        ? prev.selectedCollections.filter(id => id !== collectionId)
        : [...prev.selectedCollections, collectionId],
    }));
  };

  const handleToggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      alert('Please select a marketplace category');
      return;
    }

    setIsSubmitting(true);
    try {
      const attributeValues = Object.entries(formData.attributeValues).map(
        ([attributeId, value]) => ({ attributeId, value })
      );

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        thumbnailUrl: formData.thumbnailUrl,
        marketplaceCategoryId: selectedCategory.id,
        attributeValues,
        collectionIds: formData.selectedCollections,
        tagIds: formData.selectedTags,
      };

      await productsAPI.create(productData);
      alert('Product created successfully!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        thumbnailUrl: '',
        attributeValues: {},
        selectedCollections: [],
        selectedTags: [],
      });
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Basic details about your product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Samsung Galaxy S25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Describe your product..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="999.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={e => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={e => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Marketplace Category */}
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Category *</CardTitle>
          <CardDescription>
            Select where this product belongs in the platform taxonomy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategorySelector
            value={selectedCategory?.id}
            onChange={(id, cat) => setSelectedCategory(cat)}
          />
        </CardContent>
      </Card>

      {/* Category Attributes */}
      {categoryDetails && categoryDetails.attributes && categoryDetails.attributes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Attributes</CardTitle>
            <CardDescription>
              Fill in the required attributes for {categoryDetails.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryDetails.attributes.map((attr: CategoryAttribute) => (
              <div key={attr.attributeId}>
                <label className="block text-sm font-medium mb-2">
                  {attr.attribute.name}
                  {attr.required && <span className="text-red-500"> *</span>}
                </label>

                {attr.attribute.type === 'text' && (
                  <input
                    type="text"
                    required={attr.required}
                    value={formData.attributeValues[attr.attributeId] || ''}
                    onChange={e => handleAttributeChange(attr.attributeId, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={`Enter ${attr.attribute.name}`}
                  />
                )}

                {attr.attribute.type === 'number' && (
                  <input
                    type="number"
                    required={attr.required}
                    value={formData.attributeValues[attr.attributeId] || ''}
                    onChange={e => handleAttributeChange(attr.attributeId, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={`Enter ${attr.attribute.name}`}
                  />
                )}

                {attr.attribute.type === 'select' && attr.options && (
                  <select
                    required={attr.required}
                    value={formData.attributeValues[attr.attributeId] || ''}
                    onChange={e => handleAttributeChange(attr.attributeId, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select {attr.attribute.name}</option>
                    {attr.options.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {attr.attribute.type === 'date' && (
                  <input
                    type="date"
                    required={attr.required}
                    value={formData.attributeValues[attr.attributeId] || ''}
                    onChange={e => handleAttributeChange(attr.attributeId, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Collections */}
      {collections && collections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>
              Add this product to your collections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {collections.map(collection => (
              <label key={collection.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={formData.selectedCollections.includes(collection.id)}
                  onChange={() => handleToggleCollection(collection.id)}
                  className="rounded"
                />
                <span>{collection.name}</span>
                {collection._count?.products && (
                  <span className="text-xs text-gray-500">({collection._count.products})</span>
                )}
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Add custom tags to label this product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="text"
                value={searchTagQuery}
                onChange={e => setSearchTagQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(searchTagQuery ? searchResults : tags).map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1 rounded-full border transition-colors',
                    formData.selectedTags.includes(tag.id)
                      ? 'bg-blue-100 border-blue-300'
                      : 'hover:bg-gray-100'
                  )}
                  style={{
                    backgroundColor: tag.color && formData.selectedTags.includes(tag.id)
                      ? `${tag.color}40`
                      : undefined,
                  }}
                >
                  <span className="text-sm">{tag.name}</span>
                  {formData.selectedTags.includes(tag.id) && <X size={14} />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Tags Display */}
      {formData.selectedTags.length > 0 && (
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Selected Tags:</p>
            <div className="flex flex-wrap gap-2">
              {formData.selectedTags.map(tagId => {
                const tag = tags?.find(t => t.id === tagId);
                return tag ? (
                  <Badge key={tagId} variant="secondary">
                    {tag.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Product...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
