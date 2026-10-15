export type CategoryChip = { slug: string; name: string }

type CategoryFiltersProps = {
  active: string
  categories: CategoryChip[]
  onChange: (slug: string) => void
}

/** "All" plus one pill per category; scrolls sideways on small screens. */
export function CategoryFilters({ active, categories, onChange }: CategoryFiltersProps) {
  const chips: CategoryChip[] = [{ slug: '', name: 'All' }, ...categories]

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0" role="group" aria-label="Product categories">
      <div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
        {chips.map((category) => {
          const isActive = active === category.slug
          return (
            <button
              className={`category-pill shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9B27C] focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-[#173f32] bg-[#173f32] text-white shadow-[0_8px_18px_rgba(23,63,50,.18)] dark:border-[#D9B27C] dark:bg-[#D9B27C] dark:text-stone-950'
                  : 'border-stone-200 bg-white text-stone-600 hover:-translate-y-0.5 hover:border-[#dda96e] hover:text-[#a8682f] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
              }`}
              key={category.slug || 'all'}
              onClick={() => onChange(category.slug)}
              type="button"
              aria-pressed={isActive}
            >
              {category.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
