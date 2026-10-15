import type { Variant } from '../../types/api'
import { formatMoney } from '../../utils/format'

type VariantSelectorProps = {
  variants: Variant[]
  selectedId: string | undefined
  onSelect: (variant: Variant) => void
  legend: string
}

export function VariantSelector({ variants, selectedId, onSelect, legend }: VariantSelectorProps) {
  return (
    <fieldset className="product-weight pdp-variants">
      <legend>{legend}</legend>
      <div>
        {variants.map((variant) => (
          <label key={variant.id} className={!variant.inStock ? 'is-unavailable' : ''}>
            <input
              type="radio"
              name="variant"
              value={variant.id}
              checked={selectedId === variant.id}
              disabled={!variant.inStock}
              onChange={() => onSelect(variant)}
            />
            <span>
              <b>{variant.label}</b>
              <small>{variant.inStock ? formatMoney(variant.price) : 'Sold out'}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
