/** 4.666 → "4.7" */
export const formatRating = (rating: number) => (Math.round(rating * 10) / 10).toFixed(1)

/** Whole-percent saving against the compare-at price (0 when there is none). */
export const discountOf = (price: number, compareAtPrice?: number | null) =>
  compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0

const BADGE_CLASS: Record<string, string> = {
  bestseller: 'bg-[#b27a10] text-white',
  'pure comb': 'bg-[#4f8245] text-white',
  'limited harvest': 'bg-[#f7d4cd] text-[#8b342a]',
  'new season': 'bg-[#dbe8c9] text-[#385b2e]',
  new: 'bg-[#dbe8c9] text-[#385b2e]',
}

export const badgeClassOf = (badge: string) => BADGE_CLASS[badge.toLowerCase()] ?? 'bg-[#173f32] text-[#f3d9a4]'
