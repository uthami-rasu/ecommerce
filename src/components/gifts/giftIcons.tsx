import { createElement } from 'react'
import {
  Award,
  Crown,
  Flame,
  Gem,
  Gift,
  Headset,
  Heart,
  Leaf,
  Package,
  Percent,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import type { GiftIcon } from '../../types/api'

/** The icon names the admin can choose from (mirrors GIFT_ICONS on the API). */
const GIFT_ICON_COMPONENTS: Record<GiftIcon, LucideIcon> = {
  tag: Tag,
  flame: Flame,
  crown: Crown,
  gem: Gem,
  gift: Gift,
  percent: Percent,
  truck: Truck,
  package: Package,
  shield: ShieldCheck,
  sparkles: Sparkles,
  heart: Heart,
  headset: Headset,
  star: Star,
  leaf: Leaf,
  wand: WandSparkles,
  award: Award,
}

/** Renders an admin-chosen icon; unknown names fall back to a gift. */
export function GiftIconView({ name, size = 16, className }: { name: GiftIcon; size?: number; className?: string }) {
  return createElement(GIFT_ICON_COMPONENTS[name] ?? Gift, { size, className, 'aria-hidden': true })
}
