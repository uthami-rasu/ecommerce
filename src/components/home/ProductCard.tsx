import { Check, Heart, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../../types/product'
import { ProductRating } from './ProductRating'

type ProductCardProps = {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <article className="product-card group relative mx-auto flex w-full flex-col overflow-hidden border border-[#e8e1d6] bg-white shadow-[0_12px_35px_rgba(55,36,17,0.06)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(50,33,16,0.12)] dark:border-stone-800 dark:bg-stone-900" data-reveal style={{ transitionDelay: `${index * 45}ms` }}>
      <div className="relative aspect-[4/4.2] overflow-hidden bg-[#f3eee5]">
        <img
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#3b5b4e] backdrop-blur">Bestseller</span>
        <button className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 transition hover:scale-105 ${isLiked ? 'text-rose-500' : 'text-stone-500'}`} onClick={() => setIsLiked((liked) => !liked)} type="button" aria-label={`${isLiked ? 'Remove' : 'Add'} ${product.name} ${isLiked ? 'from' : 'to'} wishlist`}>
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 text-left">
        <ProductRating reviews={product.reviews} />
        <h3 className="mt-2 text-[15px] font-semibold leading-tight text-stone-950 dark:text-stone-50">
          {product.name}
        </h3>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div><p className="text-[11px] text-stone-400">{product.weight}</p><p className="mt-0.5 text-base font-bold text-[#163f31] dark:text-amber-300">₹{product.price}</p></div>
          <button className={`flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold text-white transition hover:scale-[1.03] ${isAdded ? 'bg-[#557863]' : 'bg-[#183f32] hover:bg-[#a86d32]'}`} type="button" onClick={() => { setIsAdded(true); window.setTimeout(() => setIsAdded(false), 1600) }} aria-label={`Add ${product.name} to cart`}>
            {isAdded ? <Check size={15} /> : <Plus size={15} />} {isAdded ? 'Added' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  )
}
