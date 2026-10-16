import type { Category } from '../../types/api'

export type CategoryMatch = { category: Category; parent: Category | null }

/** Finds a category (top-level or child) by slug in the `/categories` tree. */
export function findCategory(tree: Category[] | undefined, slug: string | undefined): CategoryMatch | null {
  if (!tree || !slug) return null
  for (const root of tree) {
    if (root.slug === slug) return { category: root, parent: null }
    const child = root.children.find((item) => item.slug === slug)
    if (child) return { category: child, parent: root }
  }
  return null
}

/** Leaf categories in tree order; includes all active categories from backend. */
export const leafCategories = (tree: Category[] | undefined) =>
  (tree ?? []).flatMap((root) => (root.children.length ? root.children : [root]))

export type CatalogTheme = 'honey' | 'dry-fruits' | 'all'

/** Visual theme of a category: honey, dry fruits & nuts, or the whole shop. */
export const themeOf = (match: CategoryMatch | null): CatalogTheme => {
  if (!match) return 'all'
  const root = match.parent ?? match.category
  return root.slug === 'honey' ? 'honey' : 'dry-fruits'
}
