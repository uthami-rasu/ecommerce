import mixedFruits from '../assets/images/19c6c95934212ac057b1530c5e4f5122c4a2c598.webp'
import cashews from '../assets/images/42b27289e10fb466136cbb956a6139f0542888a0.webp'
import greenKiwi from '../assets/images/46a450fc32579f8dd007794e8719e505c88017ba.webp'
import yellowKiwi from '../assets/images/907ac892879c823d09936261026ca3280452b11d.webp'
import murukku from '../assets/images/ad903c3c8ce3e6e51fe06f17ea463992aefb0f15.webp'
import redBerries from '../assets/images/a758edce84f7c2653677a48f37b6c69f22c239cf.webp'
import type { ProductCategory, TrendingProduct } from '../types/product'

export const trendingCategories: Array<'All' | ProductCategory> = [
  'All',
  'Nuts',
  'Mixed nuts',
  'Peanuts',
  'Dried fruits',
]

export const trendingProducts: TrendingProduct[] = [
  { id: 1, name: 'Crunchy Masala Bites', image: murukku, category: 'Other nuts', price: 349, layout: 'standard' },
  { id: 2, name: 'Royal Trail Mix', image: mixedFruits, category: 'Mixed nuts', price: 599, layout: 'standard' },
  { id: 3, name: 'Golden Kiwi Slices', image: yellowKiwi, category: 'Dried fruits', price: 449, layout: 'wide' },
  { id: 4, name: 'Ruby Cranberries', image: redBerries, category: 'Dried fruits', price: 399, layout: 'wide' },
  { id: 5, name: 'Whole Premium Cashews', image: cashews, category: 'Nuts', price: 799, layout: 'standard' },
  { id: 6, name: 'Green Kiwi Coins', image: greenKiwi, category: 'Dried fruits', price: 449, layout: 'standard' },
]
