// Keep old tier-related code (for backward compatibility)
export type PackTier = 'starter' | 'standard' | 'premium'

export const packTierLabels: Record<PackTier, string> = {
  starter: 'Starter tier',
  standard: 'Standard tier',
  premium: 'Premium tier',
}

export const packTierColors: Record<PackTier, string> = {
  starter: '#94a3b8',
  standard: '#0E8279',
  premium: '#f59e0b',
}

// Old CoinPackage type (keep for backward compatibility)
export type OldCoinPackage = {
  id: string
  coins: number
  price: number
  label: string
  badge?: string
  tier: PackTier
  active: boolean
  createdAt: string
}

// New CoinPackage type matching API
import type { Package } from '../../redux/apiSlices/packageSlice';
export type CoinPackage = Package;

// Old initial data (keep for backward compatibility)
export const initialCoinPackages: OldCoinPackage[] = [
  {
    id: 'pkg_50',
    coins: 50,
    price: 49,
    label: 'Starter',
    tier: 'starter',
    active: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'pkg_80',
    coins: 80,
    price: 79,
    label: 'Standard',
    tier: 'starter',
    active: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'pkg_100',
    coins: 100,
    price: 99,
    label: 'Plus',
    badge: 'Save 5%',
    tier: 'standard',
    active: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'pkg_150',
    coins: 150,
    price: 149,
    label: 'Pro',
    badge: 'Most popular',
    tier: 'standard',
    active: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'pkg_200',
    coins: 200,
    price: 199,
    label: 'Max',
    badge: 'Best value',
    tier: 'premium',
    active: true,
    createdAt: '2024-01-15',
  },
]

export function pricePerCoin(pkg: OldCoinPackage): number {
  return pkg.price / pkg.coins
}
