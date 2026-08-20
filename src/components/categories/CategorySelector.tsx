'use client';

import React, { useState, useMemo } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { MarketplaceCategory } from '@/lib/api';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  value?: string;
  onChange: (categoryId: string, category: MarketplaceCategory) => void;
  onlyLeaf?: boolean; // Only allow selecting leaf categories
}

export function CategorySelector({ value, onChange, onlyLeaf = true }: CategorySelectorProps) {
  const { data: categories, isLoading } = useCategories();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState<MarketplaceCategory[]>([]);

  // Find all categories in a flat structure for easier lookup
  const flatCategories = useMemo(() => {
    const flat: MarketplaceCategory[] = [];
    const traverse = (cats?: MarketplaceCategory[]) => {
      if (!cats) return;
      cats.forEach(cat => {
        flat.push(cat);
        traverse(cat.children);
      });
    };
    traverse(categories);
    return flat;
  }, [categories]);

  // Update selected path when value changes
  React.useEffect(() => {
    if (value && flatCategories.length > 0) {
      const buildPath = (catId: string): MarketplaceCategory[] => {
        const cat = flatCategories.find(c => c.id === catId);
        if (!cat) return [];
        if (cat.parentId) {
          return [...buildPath(cat.parentId), cat];
        }
        return [cat];
      };
      setSelectedPath(buildPath(value));
    }
  }, [value, flatCategories]);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedIds(newExpanded);
  };

  const handleSelect = (category: MarketplaceCategory) => {
    const hasChildren = category.children && category.children.length > 0;
    
    if (onlyLeaf && hasChildren) {
      // Expand if it has children
      toggleExpand(category.id);
    } else {
      // Select this category
      onChange(category.id, category);
      setSelectedPath([...selectedPath.slice(0, selectedPath.findIndex(p => p.id === category.id) + 1)]);
    }
  };

  const renderCategoryTree = (cats?: MarketplaceCategory[], depth = 0): React.ReactNode => {
    if (!cats || cats.length === 0) return null;

    return (
      <div>
        {cats.map(cat => {
          const hasChildren = cat.children && cat.children.length > 0;
          const isExpanded = expandedIds.has(cat.id);
          const isSelected = value === cat.id;
          const isInPath = selectedPath.some(p => p.id === cat.id);

          return (
            <div key={cat.id}>
              <button
                onClick={() => handleSelect(cat)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  isSelected && 'bg-blue-100 dark:bg-blue-900 font-semibold',
                  !cat.isActive && 'opacity-50 line-through'
                )}
                style={{ marginLeft: `${depth * 16}px` }}
              >
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(cat.id);
                    }}
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
                )}
                {!hasChildren && <div className="w-4" />}
                <div className="flex-1">
                  <div className="font-medium">{cat.name}</div>
                  {cat.description && (
                    <div className="text-xs text-gray-500">{cat.description}</div>
                  )}
                </div>
                {!cat.isActive && (
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">Inactive</span>
                )}
              </button>

              {isExpanded && renderCategoryTree(cat.children, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      {selectedPath.length > 0 && (
        <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <span className="font-medium">Selected Path:</span>
          <div className="flex items-center gap-1">
            {selectedPath.map((cat, i) => (
              <React.Fragment key={cat.id}>
                {i > 0 && <ChevronRight size={16} className="text-gray-400" />}
                <button
                  onClick={() => {
                    const newPath = selectedPath.slice(0, i + 1);
                    const lastCat = newPath[newPath.length - 1];
                    onChange(lastCat.id, lastCat);
                    setSelectedPath(newPath);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {cat.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Category Tree */}
      <div className="border rounded-lg p-3 bg-white dark:bg-gray-950">
        {renderCategoryTree(categories)}
      </div>
    </div>
  );
}
