export type HoneyProduct = {
  id: string
  slug: string
  name: string
  subtitle: string
  image: string
  origin: string
  category: 'Raw honey' | 'Honeycomb' | 'Infused honey' | 'Gift sets'
  size: string
  price: number
  compareAtPrice?: number
  rating: number
  reviews: number
  badge?: 'Bestseller' | 'Pure comb' | 'Limited harvest' | 'New season'
  inStock: boolean
}

export type CatalogSort = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'
