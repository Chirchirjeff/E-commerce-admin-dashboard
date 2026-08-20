# Hybrid Category System - Frontend Integration

## Overview
The frontend admin dashboard has been fully integrated with the backend's hybrid category and product classification system. Sellers can now:

1. **View Marketplace Categories** - Platform-controlled hierarchical taxonomy
2. **Manage Collections** - Create and organize products into custom collections
3. **Manage Tags** - Create custom tags and assign to products
4. **Create Products** - With marketplace category selection, dynamic attributes, collections, and tags

---

## New Files Added

### API Integration Layer
- **`src/lib/api.ts`** (400+ lines)
  - Axios instance with JWT token injection
  - TypeScript interfaces for all models
  - API client functions grouped by resource
  - Methods for categories, attributes, collections, tags, and products

### Custom Hooks
- **`src/hooks/useCategories.ts`** - Category queries and mutations
- **`src/hooks/useCollections.ts`** - Collection queries and mutations
- **`src/hooks/useTags.ts`** - Tag queries and mutations

### Components
- **`src/components/categories/CategorySelector.tsx`**
  - Interactive hierarchical category selector
  - Breadcrumb trail showing selected path
  - Expand/collapse UI for categories
  - Supports leaf-node-only selection

- **`src/components/categories/CategoriesPanel.tsx`**
  - Tabbed interface showing all categories, collections, and tags
  - Hierarchical category tree with product counts
  - Collections list with product counts
  - Tags cloud display with color support

- **`src/components/products/CreateProductForm.tsx`**
  - Complete product creation form
  - Marketplace category selection
  - Dynamic attribute fields based on category
  - Collection assignment
  - Tag assignment with search
  - Form validation and submission

### Pages
- **`src/app/(dashboard)/products/page.tsx`** - Updated products dashboard
  - View mode toggle (categories vs. table)
  - Categories panel display
  - Sample product table with category, collections, and tags

- **`src/app/(dashboard)/products/create/page.tsx`** - NEW
  - Product creation page
  - Integrates CreateProductForm

---

## Component Architecture

### CategorySelector
```typescript
<CategorySelector
  value={selectedCategoryId}
  onChange={(id, category) => handleSelect(id, category)}
  onlyLeaf={true}  // Only leaf categories
/>
```

**Features**:
- Hierarchical tree display with expand/collapse
- Breadcrumb showing selected path
- Inactive category indication
- Product count per category
- Click-to-navigate parent categories

### CategoriesPanel
```typescript
<CategoriesPanel />
```

**Features**:
- Three tabs: Marketplace Categories, Collections, Tags
- Category tree with product counts
- Collections list
- Tags cloud
- Real-time data from API

### CreateProductForm
```typescript
<CreateProductForm />
```

**Features**:
- Product name, description, price, stock
- Marketplace category selector
- Dynamic attributes from category
- Collection assignment
- Tag assignment with search
- Form validation
- Error handling

---

## API Integration

All API calls are made through `src/lib/api.ts`:

### Categories API
```typescript
categoriesAPI.getAll(tree: boolean)          // Get all categories
categoriesAPI.getById(id)                    // Get single category
categoriesAPI.getBySlug(slug)                // Get by slug
categoriesAPI.getBreadcrumb(id)              // Get breadcrumb path
categoriesAPI.create(data)                   // Create (admin)
categoriesAPI.update(id, data)               // Update (admin)
```

### Collections API
```typescript
collectionsAPI.getAll()                      // Get seller's collections
collectionsAPI.create(data)                  // Create collection
collectionsAPI.addProduct(collectionId, productId)
collectionsAPI.removeProduct(collectionId, productId)
```

### Tags API
```typescript
tagsAPI.getAll()                             // Get seller's tags
tagsAPI.search(query)                        // Search tags
tagsAPI.create(data)                         // Create tag
tagsAPI.addTagsToProduct(productId, tagIds) // Bulk add tags
```

### Products API
```typescript
productsAPI.create(data)                     // Create with all new fields
productsAPI.update(id, data)                 // Update product
```

---

## Data Flow

### 1. Creating a Product

```
User clicks "Add Product"
    ↓
Opens CreateProductForm
    ↓
Selects Marketplace Category (from CategorySelector)
    ↓
Category attributes load dynamically
    ↓
User fills basic info + attributes
    ↓
User selects Collections (from useCollections)
    ↓
User selects Tags (from useTags)
    ↓
Submits form
    ↓
API creates product with:
  - marketplaceCategoryId (required)
  - attributeValues (validated)
  - collectionIds (seller-scoped)
  - tagIds (seller-scoped)
```

### 2. Viewing Categories

```
User opens Products page
    ↓
CategoriesPanel loaded
    ↓
useCategories fetches from GET /marketplace-categories?tree=true
    ↓
Displays hierarchical tree
    ↓
useCollections fetches from GET /seller/collections
    ↓
useTags fetches from GET /seller/tags
    ↓
User can navigate categories
```

---

## Hooks Usage

### useCategories()
```typescript
const { data: categories, isLoading, error } = useCategories();
// Returns tree structure of all active marketplace categories
```

### useCategoryById(id)
```typescript
const { data: category } = useCategoryById(categoryId);
// Returns category details including attributes
```

### useCollections()
```typescript
const { data: collections } = useCollections();
// Returns seller's collections with product counts
```

### useTags()
```typescript
const { data: tags } = useTags();
// Returns seller's tags
```

### useSearchTags(query)
```typescript
const { data: results } = useSearchTags('featured');
// Returns matching tags (min 1 char)
```

### useCreateProduct()
```typescript
const createMutation = useCreateProduct();
// Usage: createMutation.mutate(productData);
```

---

## Environment Configuration

Ensure `.env.local` is configured:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The API client automatically:
- Adds JWT token from `sessionStorage.access_token` to all requests
- Handles 401 responses (can extend with redirect to login)

---

## Component Integration Points

### In app.tsx or layout
If using React Query (already in dependencies), ensure QueryClientProvider:
```typescript
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### Navigation Updates
Add to navigation menu:
```
Products
├── View All
├── Create New
└── By Category (new)
```

---

## UI/UX Features

### Category Selection
- **Hierarchical Display**: Expand/collapse parents
- **Breadcrumb Trail**: Show selection path
- **Search**: Not implemented (can add with parent's support)
- **Inactive Indicators**: Gray out inactive categories
- **Product Counts**: Show products per category

### Collections
- **List View**: Show name, description, product count
- **Add/Remove Products**: Via edit flow
- **Status**: Active/Inactive badge

### Tags
- **Cloud Display**: Colored badges with optional hex color
- **Search**: Real-time search as user types
- **Product Count**: Show tagged products

### Product Creation
- **Step-by-Step**: Category → Attributes → Collections → Tags
- **Validation**: Required attributes enforced
- **Feedback**: Loading states, error handling, success message
- **Auto-Complete**: Tag search with suggestions

---

## Error Handling

All API calls include error handling:

```typescript
try {
  await productsAPI.create(productData);
} catch (error) {
  // API client error
  // Response has data: { message: string, statusCode: number }
}
```

React Query automatically:
- Retries failed requests
- Caches successful responses
- Invalidates related queries on mutations

---

## Performance Considerations

1. **Caching**
   - Categories cached with key `['categories']`
   - Collections cached with key `['collections']`
   - Tags cached with key `['tags']`
   - Invalidated on mutations

2. **Query Optimization**
   - Categories fetched with `tree=true` for hierarchy
   - Lazy loading on component mount
   - Search queries only fire with non-empty input

3. **Component Optimization**
   - Memoization of flattened categories
   - useMemo for category lookup tables
   - Debounced tag search (optional, can add)

---

## Testing the Integration

### 1. Start Backend
```bash
cd E-commerce-backend
npm run start:dev
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Frontend
```bash
cd E-commerce-admin-dashboard
npm run dev
```

### 4. Access Dashboard
- Open `http://localhost:3000`
- Login with seller credentials
- Navigate to `/products`
- View categories panel
- Create a new product
- Select marketplace category
- Fill in required attributes
- Add to collections
- Assign tags
- Submit

---

## Future Enhancements

1. **Add Admin Category Management**
   - Create/edit/delete categories
   - Manage attributes per category
   - Reorder categories

2. **Bulk Operations**
   - Bulk assign collections
   - Bulk assign tags
   - Bulk create products from CSV

3. **Advanced Filtering**
   - Filter products by attribute values
   - Filter by category level
   - Filter by collection/tag

4. **Search & Autocomplete**
   - Search categories by name
   - Search products by attributes
   - Tag autocomplete

5. **Analytics**
   - Products per category chart
   - Popular collections
   - Most used tags

---

## Files Modified

### Updated Files
- `.env.local` - Changed API_URL to localhost:3000
- `src/app/(dashboard)/products/page.tsx` - Added CategoriesPanel integration

### New Files (22 total)
- `src/lib/api.ts`
- `src/hooks/useCategories.ts`
- `src/hooks/useCollections.ts`
- `src/hooks/useTags.ts`
- `src/components/categories/CategorySelector.tsx`
- `src/components/categories/CategoriesPanel.tsx`
- `src/components/products/CreateProductForm.tsx`
- `src/app/(dashboard)/products/create/page.tsx`

---

## Support

For API documentation, see backend's `IMPLEMENTATION_SUMMARY.md`.

For issues with frontend integration:
1. Check console for API errors
2. Verify backend is running
3. Check authentication token in sessionStorage
4. Verify database has marketplace categories (run seed)
