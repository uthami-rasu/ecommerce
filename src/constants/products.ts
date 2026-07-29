import peanutChikki from '../assets/images/7890a4ea83eb4c865b720f64d732214fe5e22733.jpg'
import almonds from '../assets/images/7eaa4ec251a43e5030c515e16baaac61013784e6 (1).jpg'
import driedFigs from '../assets/images/9186c4f45f15fbaf619c01424637adde5a7bbfee.png'
import greenKiwi from '../assets/images/46a450fc32579f8dd007794e8719e505c88017ba.png'
import redBerries from '../assets/images/c8cf9f3396dd013d6332516298f5ca4b3d31e784.jpg'
import driedAmla from '../assets/images/7ca050cb646a18398f2d3912b62a9f7e9b9bdbec.png'
import blackPrunes from '../assets/images/0128c4a3becf9417477ab8018b0cf9fc7d533e94.png'
import sweetRings from '../assets/images/849b878e0e8dd1a695c9a525c5423c4eb3bb1243.jpg'
import type { Product, ProductCategory } from '../types/product'

export const productCategories: Array<'All' | ProductCategory> = [
  'Nuts',
  'Mixed nuts',
  'Peanuts',
  'Dried fruits',
  'Other nuts',
]

export const favoriteProducts: Product[] = [
  { id: 1, name: 'Premium Peanut Chikki', image: peanutChikki, category: 'Peanuts', weight: '500g Pack', price: 699, reviews: 65 },
  { id: 2, name: 'Premium California Almonds', image: almonds, category: 'Nuts', weight: '500g Pack', price: 699, reviews: 65 },
  { id: 3, name: 'Premium Dried Figs', image: driedFigs, category: 'Dried fruits', weight: '500g Pack', price: 699, reviews: 65 },
  { id: 4, name: 'Premium Green Kiwi', image: greenKiwi, category: 'Dried fruits', weight: '500g Pack', price: 699, reviews: 65 },
  { id: 5, name: 'Premium Red Berries', image: redBerries, category: 'Other nuts', weight: '500g Pack', price: 699, reviews: 65 },
  { id: 6, name: 'Premium Dried Amla', image: driedAmla, category: 'Mixed nuts', weight: '500g Pack', price: 699, reviews: 65 },
  { id: 7, name: 'Premium Black Prunes', image: blackPrunes, category: 'Dried fruits', weight: '500g Pack', price: 699, reviews: 65 },
  { id: 8, name: 'Premium Sweet Rings', image: sweetRings, category: 'Other nuts', weight: '500g Pack', price: 699, reviews: 65 },
]
