import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Alert, Spin } from 'antd'
import {
  ArrowUpRight,
  LifeBuoy,
  Users as UsersIcon,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useGetAdminDashboardOverviewQuery } from '../../redux/apiSlices/userSlice'

const numberFmt = new Intl.NumberFormat('en-US')
const revenueFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default function DashboardOverview() {
  const { data, isLoading, isError } = useGetAdminDashboardOverviewQuery()
  const overview = data?.data

  const chartData = useMemo(
    () =>
      (overview?.revinewGraph ?? []).map((item) => ({
        month: item.month,
        revenue: Number(item.revenue),
      })),
    [overview?.revinewGraph],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center py-6">
        <Spin size="large" />
      </div>
    )
  }

  if (isError || !overview) {
    return (
      <div className="py-6">
        <Alert
          type="error"
          message="Failed to load dashboard overview"
          showIcon
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of Spend Lock — revenue, users, and items that need
          attention.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Kpi
          label="Total revenue"
          value={revenueFmt.format(Number(overview.totalRevenue))}
          icon={Wallet}
          tone="brand"
          href="/dashboard/revenue"
        />
        <Kpi
          label="Active users"
          value={numberFmt.format(overview.totalActiveUsers)}
          icon={UsersIcon}
          tone="blue"
          href="/dashboard/users"
        />
        <Kpi
          label="Open tickets"
          value={numberFmt.format(overview.openTickets)}
          icon={LifeBuoy}
          tone="amber"
          href="/dashboard/support"
        />
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Revenue (last 6 months)
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Monthly coin purchase revenue
            </p>
          </div>
          <Link
            to="/dashboard/revenue"
            className="text-xs font-medium text-brand hover:underline"
          >
            View report
          </Link>
        </div>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%" minHeight={256}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${Math.round(v)}`}
              />
              <Tooltip
                formatter={(v) => revenueFmt.format(Number(v) || 0)}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#0E8279"
                name="Revenue"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

type Tone = 'brand' | 'blue' | 'amber'

const toneStyles: Record<Tone, string> = {
  brand: 'bg-brand/10 text-brand',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone: Tone
  href: string
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-surface-border bg-surface-card p-5 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${toneStyles[tone]}`}
        >
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        <ArrowUpRight
          size={14}
          className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </Link>
  )
}
