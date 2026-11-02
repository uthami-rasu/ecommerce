import type { AdminVariant } from '../../types/api'

/** One editable size / pack of a product. Strings so inputs can be empty while typing. */
export type VariantRow = {
  /** Present for variants that already exist on the server. */
  id?: string
  label: string
  price: string
  compareAtPrice: string
  stock: string
  isActive: boolean
}

export const emptyVariant = (label = ''): VariantRow => ({ label, price: '', compareAtPrice: '', stock: '', isActive: true })

export const toVariantRow = (variant: AdminVariant): VariantRow => ({
  id: variant.id,
  label: variant.label,
  price: String(variant.price),
  compareAtPrice: variant.compareAtPrice === null ? '' : String(variant.compareAtPrice),
  stock: String(variant.stock),
  isActive: variant.isActive,
})

/** API shape of a row (rupees). An MRP that isn't above the price is dropped rather than rejected. */
export const toVariantInput = (row: VariantRow, sortOrder: number) => {
  const price = Number(row.price)
  const mrp = row.compareAtPrice.trim() === '' ? null : Number(row.compareAtPrice)
  return {
    label: row.label.trim(),
    price,
    compareAtPrice: mrp !== null && mrp > price ? mrp : null,
    stock: Math.trunc(Number(row.stock)),
    sortOrder,
    isActive: row.isActive,
  }
}

/** First problem with the rows, phrased for the admin; null when they can be saved. */
export function validateVariants(rows: VariantRow[]): string | null {
  if (!rows.length) return 'Add at least one variant (size / pack) with a price.'
  const labels = new Set<string>()
  for (const [index, row] of rows.entries()) {
    const name = row.label.trim() || `Variant ${index + 1}`
    if (!row.label.trim()) return `Variant ${index + 1}: enter a size or pack name, e.g. 250g.`
    if (labels.has(row.label.trim().toLowerCase())) return `"${row.label.trim()}" is listed twice.`
    labels.add(row.label.trim().toLowerCase())
    const price = Number(row.price)
    if (row.price.trim() === '' || !Number.isFinite(price) || price <= 0) return `${name}: enter a selling price above ₹0.`
    if (Math.round(price * 100) !== price * 100) return `${name}: price can have at most 2 decimals.`
    if (row.compareAtPrice.trim() !== '') {
      const mrp = Number(row.compareAtPrice)
      if (!Number.isFinite(mrp) || mrp < 0) return `${name}: MRP must be a number.`
      if (mrp <= price) return `${name}: MRP (₹${mrp}) must be higher than the selling price (₹${price}), or leave it empty.`
    }
    const stock = Number(row.stock)
    if (row.stock.trim() === '' || !Number.isInteger(stock) || stock < 0) return `${name}: enter stock as a whole number (0 or more).`
  }
  return null
}

/**
 * Saves edited rows through the variant endpoints: new rows first, then changes, then
 * removals — so the product never drops to zero variants mid-way. Returns whether anything changed.
 */
export async function syncVariants(
  repo: {
    addVariant: (productId: string, input: ReturnType<typeof toVariantInput>) => Promise<unknown>
    updateVariant: (productId: string, variantId: string, input: ReturnType<typeof toVariantInput>) => Promise<unknown>
    removeVariant: (productId: string, variantId: string) => Promise<unknown>
  },
  productId: string,
  original: AdminVariant[],
  rows: VariantRow[],
): Promise<boolean> {
  const before = new Map(original.map((variant) => [variant.id, variant]))
  const inputs = rows.map((row, index) => ({ row, input: toVariantInput(row, index) }))
  let changed = false
  for (const { row, input } of inputs) {
    if (row.id) continue
    await repo.addVariant(productId, input)
    changed = true
  }
  for (const { row, input } of inputs) {
    const old = row.id ? before.get(row.id) : undefined
    if (!old) continue
    const differs =
      old.label !== input.label || old.price !== input.price || old.compareAtPrice !== input.compareAtPrice ||
      old.stock !== input.stock || old.sortOrder !== input.sortOrder || old.isActive !== input.isActive
    if (!differs) continue
    await repo.updateVariant(productId, old.id, input)
    changed = true
  }
  const kept = new Set(rows.map((row) => row.id).filter(Boolean))
  for (const variant of original) {
    if (kept.has(variant.id)) continue
    await repo.removeVariant(productId, variant.id)
    changed = true
  }
  return changed
}
