import type { OldCoinPackage, PackTier } from '../coinPackages/coinPackagesData'
import type { UserRecord } from '../users/usersData'

export { packTierColors as tierColors, packTierLabels as tierLabels } from '../coinPackages/coinPackagesData'
export type { PackTier as RevenueTier } from '../coinPackages/coinPackagesData'

// Revenue comes from coin purchases — users buy coins with real money
// (from configurable packs) and spend them to lift spend-lock blocks.

export type RevenueEvent = {
  id: string
  customerId: string
  customerName?: string
  amount: number
  coins: number
  tier: PackTier
  packageId?: string
  packageLabel?: string
  occurredAt: string
}

function tierForAmount(amount: number): PackTier {
  if (amount < 100) return 'starter'
  if (amount < 180) return 'standard'
  return 'premium'
}

export function buildRevenueEvents(
  users: UserRecord[],
  packages: OldCoinPackage[] = [],
): RevenueEvent[] {
  const pkgById = new Map(packages.map((p) => [p.id, p]))
  const events: RevenueEvent[] = []
  for (const u of users) {
    for (const c of u.spendLock.coinHistory) {
      if (c.kind !== 'purchase') continue
      if (!c.amount || c.amount <= 0) continue
      const pkg = c.packageId ? pkgById.get(c.packageId) : undefined
      events.push({
        id: `${u.id}-${c.id}`,
        customerId: u.id,
        amount: c.amount,
        coins: c.coins,
        tier: pkg?.tier ?? tierForAmount(c.amount),
        packageId: c.packageId,
        packageLabel: pkg?.label,
        occurredAt: c.at,
      })
    }
  }
  events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  return events
}

export type RevenueBreakdown = Record<PackTier, number>

export type RevenueSummary = {
  total: number
  transactions: number
  coinsSold: number
  payingUsers: number
  arppu: number
  breakdown: RevenueBreakdown
  events: RevenueEvent[]
}

export function summarizeRevenue(events: RevenueEvent[]): RevenueSummary {
  const breakdown: RevenueBreakdown = { starter: 0, standard: 0, premium: 0 }
  const userIds = new Set<string>()
  let total = 0
  let coinsSold = 0
  for (const e of events) {
    breakdown[e.tier] += e.amount
    total += e.amount
    coinsSold += e.coins
    userIds.add(e.customerId)
  }
  const payingUsers = userIds.size
  return {
    total,
    transactions: events.length,
    coinsSold,
    payingUsers,
    arppu: payingUsers > 0 ? total / payingUsers : 0,
    breakdown,
    events,
  }
}

export function filterByRange(
  events: RevenueEvent[],
  fromIsoDate: string,
): RevenueEvent[] {
  return events.filter((e) => e.occurredAt.slice(0, 10) >= fromIsoDate)
}

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export type MonthlyPoint = {
  month: string
  label: string
  starter: number
  standard: number
  premium: number
  total: number
}

export function buildMonthlyTrend(
  events: RevenueEvent[],
  monthsBack = 6,
  referenceDate = new Date(),
): MonthlyPoint[] {
  const buckets = new Map<string, MonthlyPoint>()

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - i,
      1,
    )
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
    buckets.set(key, {
      month: key,
      label,
      starter: 0,
      standard: 0,
      premium: 0,
      total: 0,
    })
  }

  for (const e of events) {
    const key = monthKey(e.occurredAt)
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket[e.tier] += e.amount
    bucket.total += e.amount
  }

  return Array.from(buckets.values())
}
