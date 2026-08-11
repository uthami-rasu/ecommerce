import type { HoneyProduct } from '../types/catalog'
import honeyTrio from '../assets/images/8773eeca3cba18ea1f474f415ed58dd51b2c77ee.webp'
import honeyGift from '../assets/images/ChatGPT Image Jun 10, 2026, 11_08_40 AM 1.webp'
import meloraHoney from '../assets/images/3719332c70605ffb0114496075fad17a1e6ecb5c.webp'
import forestHoney from '../assets/category/553672e3cda4d62fbb1c7965d98b61135fe083c3.webp'
import combHoney from '../assets/category/ad0871d505385543f74adf1e567c5dca11365121.webp'
import honeyCollection from '../assets/category/9282672b5437c3df697468cc9de9bce23693c139.webp'

// This module is the API seam: replace this export with your query result and
// pass it into <CategoryPage products={data.products} /> without changing the UI.
export const honeyProducts: HoneyProduct[] = [
  {
    id: 'hon-001', slug: 'melora-raw-forest-honey', name: 'Melora Raw Forest Honey',
    subtitle: 'Deep, malty and wonderfully complex — collected from untouched forest bloom.',
    image: meloraHoney,
    origin: 'Western Ghats', category: 'Raw honey', size: '500g', price: 480,
    compareAtPrice: 560, rating: 4.9, reviews: 124, badge: 'Bestseller', inStock: true,
  },
  {
    id: 'hon-002', slug: 'wild-hive-comb-honey', name: 'Wild Hive Comb Honey',
    subtitle: 'Silken raw honey sealed inside tender, edible beeswax comb.',
    image: combHoney,
    origin: 'Nilgiri Hills', category: 'Honeycomb', size: '350g', price: 1250,
    rating: 4.8, reviews: 89, badge: 'Pure comb', inStock: true,
  },
  {
    id: 'hon-003', slug: 'ancient-forest-artisanal', name: 'Ancient Forest Artisanal',
    subtitle: 'A dark amber harvest with soft woody notes and a long floral finish.',
    image: forestHoney,
    origin: 'Aravalli Forest', category: 'Raw honey', size: '450g', price: 890,
    compareAtPrice: 990, rating: 4.7, reviews: 45, badge: 'Limited harvest', inStock: true,
  },
  {
    id: 'hon-004', slug: 'acacia-gold-honey', name: 'Acacia Gold Honey',
    subtitle: 'Pale, delicate and slow to crystallise, with a clean vanilla-like sweetness.',
    image: honeyCollection,
    origin: 'Kashmir Valley', category: 'Raw honey', size: '250g', price: 620,
    rating: 4.8, reviews: 76, badge: 'New season', inStock: true,
  },
  {
    id: 'hon-005', slug: 'saffron-infused-honey', name: 'Saffron Infused Honey',
    subtitle: 'Raw mountain honey slowly rested with handpicked Kashmiri saffron.',
    image: honeyGift,
    origin: 'Pampore, Kashmir', category: 'Infused honey', size: '200g', price: 780,
    compareAtPrice: 860, rating: 4.9, reviews: 53, badge: 'Bestseller', inStock: true,
  },
  {
    id: 'hon-006', slug: 'honey-tasting-trio', name: 'The Honey Tasting Trio',
    subtitle: 'Three small-batch harvests gathered in a keepsake gifting box.',
    image: honeyTrio,
    origin: 'Three Indian terroirs', category: 'Gift sets', size: '3 × 150g', price: 1490,
    rating: 4.9, reviews: 31, badge: 'Limited harvest', inStock: true,
  },
]
