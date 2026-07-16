import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Select, Spin, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Users as UsersIcon,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useGetRevenueReportQuery } from '../../redux/apiSlices/coinHistorySlice'
import {
  buildMonthlyTrend,
  filterByRange,
  summarizeRevenue,
  tierColors,
  tierLabels,
  type RevenueEvent,
  type RevenueTier,
} from '../../components/revenue/revenueData'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const numberFmt = new Intl.NumberFormat('en-US')

type RangeKey = '30d' | '90d' | '180d' | 'all'

const rangeOptions: { value: RangeKey; label: string; days: number | null }[] = [
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: '180d', label: 'Last 6 months', days: 180 },
  { value: 'all', label: 'All time', days: null },
]

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function normalizeOccurredAt(value: string) {
  return value.slice(0, 19).replace('T', ' ')
}

export default function Revenue() {
  const { data, isLoading, isError } = useGetRevenueReportQuery()
  const [range, setRange] = useState<RangeKey>('90d')

  const allEvents = useMemo(() => {
    const events = data?.data?.events ?? []
    return events.map((event) => ({
      ...event,
      occurredAt:
        typeof event.occurredAt === 'string'
          ? normalizeOccurredAt(event.occurredAt)
          : event.occurredAt,
    }))
  }, [data?.data?.events])

  const rangeDays = rangeOptions.find((r) => r.value === range)?.days ?? null

  const currentEvents = useMemo(() => {
    if (rangeDays === null) return allEvents
    return filterByRange(allEvents, isoDaysAgo(rangeDays))
  }, [allEvents, rangeDays])

  const previousEvents = useMemo(() => {
    if (rangeDays === null) return []
    const from = isoDaysAgo(rangeDays * 2)
    const to = isoDaysAgo(rangeDays)
    return allEvents.filter((e) => {
      const d = e.occurredAt.slice(0, 10)
      return d >= from && d < to
    })
  }, [allEvents, rangeDays])

  const current = useMemo(
    () => summarizeRevenue(currentEvents),
    [currentEvents],
  )

  const previous = useMemo(
    () => summarizeRevenue(previousEvents),
    [previousEvents],
  )

  const monthly = useMemo(
    () => buildMonthlyTrend(allEvents, 6, new Date()),
    [allEvents],
  )

  const breakdownData = (Object.keys(current.breakdown) as RevenueTier[])
    .map((t) => ({
      key: t,
      name: tierLabels[t],
      value: current.breakdown[t],
      color: tierColors[t],
    }))
    .filter((d) => d.value > 0)

  const topSpenders = useMemo(() => {
    const totals = new Map<string, { amount: number; name: string }>()
    for (const e of currentEvents) {
      const existing = totals.get(e.customerId)
      totals.set(e.customerId, {
        amount: (existing?.amount ?? 0) + e.amount,
        name: e.customerName ?? existing?.name ?? 'Unknown user',
      })
    }
    return Array.from(totals.entries())
      .map(([userId, { amount, name }]) => ({
        userId,
        amount,
        name,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [currentEvents])

  const eventColumns: ColumnsType<RevenueEvent> = [
    {
      title: 'When',
      dataIndex: 'occurredAt',
      key: 'occurredAt',
      render: (d: string) => <span className="text-xs text-gray-500">{d}</span>,
      sorter: (a, b) => a.occurredAt.localeCompare(b.occurredAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Pack',
      key: 'pack',
      render: (_, e) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {e.packageLabel ?? 'Custom'}
          </span>
          <span
            className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              backgroundColor: `${tierColors[e.tier]}1a`,
              color: tierColors[e.tier],
            }}
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: tierColors[e.tier] }}
            />
            {tierLabels[e.tier]}
          </span>
        </div>
      ),
      filters: (Object.keys(tierLabels) as RevenueTier[]).map((t) => ({
        text: tierLabels[t],
        value: t,
      })),
      onFilter: (value, e) => e.tier === value,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, e) => (
        <Link
          to={`/dashboard/users/${e.customerId}`}
          className="text-sm text-gray-800 hover:text-brand"
        >
          {e.customerName ?? 'Unknown'}
        </Link>
      ),
    },
    {
      title: 'Coins',
      dataIndex: 'coins',
      key: 'coins',
      align: 'right',
      render: (n: number) => (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900">
          <Coins size={13} className="text-amber-500" />
          {numberFmt.format(n)}
        </span>
      ),
      sorter: (a, b) => a.coins - b.coins,
    },
    {
      title: 'Amount',
      key: 'amount',
      align: 'right',
      render: (_, e) => (
        <span className="text-sm font-semibold text-gray-900">
          {currency.format(e.amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center py-6">
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-6">
        <Alert type="error" message="Failed to load revenue report" showIcon />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Revenue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Revenue from coin purchases — users buy coins to lift spend-lock
            blocks after rule breaches.
          </p>
        </div>
        <Select
          value={range}
          onChange={setRange}
          style={{ width: 180 }}
          options={rangeOptions.map((r) => ({
            value: r.value,
            label: r.label,
          }))}
        />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total revenue"
          value={currency.format(current.total)}
          previous={previous.total}
          currentValue={current.total}
          icon={Wallet}
          tone="brand"
          showDelta={rangeDays !== null}
        />
        <KpiCard
          label="Paying users"
          value={numberFmt.format(current.payingUsers)}
          previous={previous.payingUsers}
          currentValue={current.payingUsers}
          icon={UsersIcon}
          tone="blue"
          showDelta={rangeDays !== null}
        />
        <KpiCard
          label="Coins sold"
          value={numberFmt.format(current.coinsSold)}
          previous={previous.coinsSold}
          currentValue={current.coinsSold}
          icon={Coins}
          tone="amber"
          showDelta={rangeDays !== null}
        />
        <KpiCard
          label="Avg. revenue / payer"
          value={currency.format(Math.round(current.arppu))}
          previous={previous.arppu}
          currentValue={current.arppu}
          icon={ArrowUpRight}
          tone="violet"
          showDelta={rangeDays !== null}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Monthly revenue trend
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Last 6 months by coin pack tier
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total (range)</div>
              <div className="text-lg font-semibold text-gray-900">
                {currency.format(current.total)}
              </div>
              <div className="text-[11px] text-gray-500">
                {current.transactions} transaction
                {current.transactions === 1 ? '' : 's'}
              </div>
            </div>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%" minHeight={288}>
              <BarChart data={monthly} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${Math.round(v)}`}
                />
                <Tooltip
                  formatter={(v) => currency.format(Number(v) || 0)}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Bar dataKey="starter" stackId="r" fill={tierColors.starter} name={tierLabels.starter} />
                <Bar dataKey="standard" stackId="r" fill={tierColors.standard} name={tierLabels.standard} />
                <Bar dataKey="premium" stackId="r" fill={tierColors.premium} name={tierLabels.premium} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Pack mix
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Revenue split by coin pack tier in the selected range
          </p>
          {breakdownData.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">No revenue in this range.</p>
          ) : (
            <>
              <div className="mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {breakdownData.map((d) => (
                        <Cell key={d.key} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => currency.format(Number(v) || 0)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-2">
                {breakdownData.map((d) => {
                  const pct = current.total > 0 ? (d.value / current.total) * 100 : 0
                  return (
                    <li key={d.key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span className="text-xs text-gray-700">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {currency.format(d.value)}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {pct.toFixed(1)}%
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </section>

      {topSpenders.length > 0 && (
        <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <h2 className="text-base font-semibold text-gray-900">Top spenders</h2>
          <p className="mt-1 text-xs text-gray-500">
            Users with the highest coin spend in the selected range
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {topSpenders.map((s, idx) => (
              <li
                key={s.userId}
                className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-brand">
                  #{idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/dashboard/users/${s.userId}`}
                    className="block truncate text-sm font-medium text-gray-900 hover:text-brand"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {currency.format(s.amount)} spent
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex items-center justify-between border-b border-surface-border p-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Coin purchases
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Every coin purchase in the selected range
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {currentEvents.length} transaction
            {currentEvents.length === 1 ? '' : 's'}
          </span>
        </div>
        <Table<RevenueEvent>
          className="dashboard-table"
          rowKey="id"
          columns={eventColumns}
          dataSource={currentEvents}
          pagination={
            currentEvents.length > 10 ? { pageSize: 10, showSizeChanger: false } : false
          }
          locale={{ emptyText: 'No coin purchases in this range.' }}
        />
      </section>
    </div>
  )
}

type Tone = 'brand' | 'blue' | 'amber' | 'violet'

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  violet: 'bg-violet-100 text-violet-700',
}

function KpiCard({
  label,
  value,
  previous,
  currentValue,
  icon: Icon,
  tone,
  showDelta,
}: {
  label: string
  value: string
  previous: number
  currentValue: number
  icon: LucideIcon
  tone: Tone
  showDelta: boolean
}) {
  const delta =
    previous === 0 ? null : ((currentValue - previous) / previous) * 100
  const up = (delta ?? 0) >= 0
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${toneStyles[tone]}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
      {showDelta && delta !== null && (
        <div
          className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
            up ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta).toFixed(1)}% vs previous
        </div>
      )}
      {showDelta && delta === null && previous === 0 && currentValue > 0 && (
        <div className="mt-1 text-xs text-gray-500">New this range</div>
      )}
    </div>
  )
}
