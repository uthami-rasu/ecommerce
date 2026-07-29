import { HeartPulse, Leaf, ShieldCheck, Zap } from 'lucide-react'
import type { Feature } from '../types/feature'

export const leftHoneyBenefits: Feature[] = [
  {
    title: 'Rich in Antioxidants',
    description: 'Protects your body',
    icon: ShieldCheck,
  },
  {
    title: 'Natural Sweetener',
    description: 'Healthy sugar alternative',
    icon: Leaf,
  },
]

export const rightHoneyBenefits: Feature[] = [
  {
    title: 'Energy Booster',
    description: 'Natural sustained energy',
    icon: Zap,
  },
  {
    title: 'Supports Immunity',
    description: 'Builds natural defense',
    icon: HeartPulse,
  },
]
