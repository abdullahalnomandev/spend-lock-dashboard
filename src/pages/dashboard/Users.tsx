import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, Dropdown, Input, Select, App, Spin, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleSlash,
  Eye,
  Landmark,
  Lock,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
// import { useUsers, setUserStatus } from '../../components/users/usersStore'
// import {
//   authProviderLabels,
//   savingsGoalLabels,
//   spendChallengeLabels,
//   type LockStatus,
//   type SpendChallenge,
//   type OldUserRecord,
//   type UserStatus,
// } from '../../components/users/usersData'
// import StatusBadge from '../../components/users/StatusBadge'
import { useGetUsersQuery, useChangeStatusUserMutation, type User } from '../../redux/apiSlices/userSlice'
import EditUserModal from '../../components/users/EditUserModal'

// type StatusFilter = 'all' | UserStatus
// type LockFilter = 'all' | LockStatus

function relativeFromNow(iso: string): { label: string; tone: 'gray' | 'amber' | 'red' } {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return { label: 'Today', tone: 'gray' }
  if (days === 1) return { label: 'Yesterday', tone: 'gray' }
  if (days < 7) return { label: `${days}d ago`, tone: 'gray' }
  if (days < 30) return { label: `${Math.floor(days / 7)}w ago`, tone: 'amber' }
  if (days < 365) return { label: `${Math.floor(days / 30)}mo ago`, tone: 'red' }
  return { label: `${Math.floor(days / 365)}y ago`, tone: 'red' }
}

// Convert API User status to old UserStatus type
const mapStatus = (apiStatus: 'active' | 'delete'): 'active' | 'restricted' | 'banned' => {
  if (apiStatus === 'active') return 'active'
  return 'banned' // Default to banned for 'delete'
}

export default function Users() {
  const { data: usersData, isLoading, isError, error } = useGetUsersQuery({ page: 1, limit: 100 })
  const users = usersData?.data || []
  const { modal, message } = App.useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'restricted' | 'banned'>('all')
  // const [lockFilter, setLockFilter] = useState<LockFilter>('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [changeStatus] = useChangeStatusUserMutation()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      const mappedStatus = mapStatus(u.status)
      if (statusFilter !== 'all' && mappedStatus !== statusFilter) return false
      // if (lockFilter !== 'all' && u.spendLock.status !== lockFilter) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.toLowerCase().includes(q))
      )
    })
  }, [users, search, statusFilter])

  const counts = useMemo(
    () => ({
      total: users.length,
      locked: 0, // Not available in API
      breached: 0, // Not available in API
      bankBlocked: users.filter((u) => u.plaid_access_token).length,
    }),
    [users],
  )

  const confirmStatusChange = (user: User, status: 'active' | 'restricted' | 'banned', label: string) => {
    modal.confirm({
      title: `${label} ${user.name}?`,
      content:
        status === 'banned'
          ? 'Banned users cannot sign in or manage their spend locks.'
          : status === 'restricted'
            ? 'Restricted users can sign in but cannot change lock settings.'
            : 'This user will regain full access to the app.',
      okText: label,
      okButtonProps:
        status === 'banned' ? { danger: true } : undefined,
      onOk: async () => {
        try {
          await changeStatus({ id: user._id }).unwrap()
          message.success(`${user.name} is now ${status}.`)
        } catch (err) {
          message.error('Failed to update user status.')
        }
      },
    })
  }

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      fixed: 'left',
      width: 240,
      render: (_, u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold text-gray-700">
            {u.image ? (
              <img
                src={u.image}
                alt={u.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              u.name.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <Link
              to={`/dashboard/users/${u._id}`}
              className="block truncate text-sm font-semibold text-gray-900 hover:text-brand"
            >
              {u.name}
            </Link>
            <div className="truncate text-xs text-gray-500">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Bank',
      key: 'bankConnected',
      render: (_, u) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            u.plaid_access_token
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {u.plaid_access_token ? (
            <>
              <Landmark size={11} />
              Connected
            </>
          ) : (
            <>
              <AlertTriangle size={11} />
              Not connected
            </>
          )}
        </span>
      ),
      filters: [
        { text: 'Connected', value: true },
        { text: 'Not connected', value: false },
      ],
      onFilter: (value, u) => !!u.plaid_access_token === value,
    },
    // {
    //   title: 'Goal',
    //   key: 'goal',
    //   render: (_, u) => (
    //     <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
    //       {savingsGoalLabels[u.onboarding.goal]}
    //     </span>
    //   ),
    //   filters: [
    //     { text: 'Save more money', value: 'save_money' },
    //     { text: 'Stop impulse buying', value: 'stop_impulse' },
    //     { text: 'Track spending', value: 'track_spending' },
    //     { text: 'Build better habits', value: 'build_habits' },
    //   ],
    //   onFilter: (value, u) => u.onboarding.goal === value,
    // },
    // {
    //   title: 'Challenges',
    //   key: 'challenges',
    //   render: (_, u) => {
    //     const challenges = u.onboarding.challenges
    //     if (challenges.length === 0)
    //       return <span className="text-xs text-gray-400">—</span>
    //     const labels = challenges.map((c) => spendChallengeLabels[c])
    //     const extra = labels.length - 1
    //     return (
    //       <Tooltip title={labels.join(', ')}>
    //         <span className="inline-flex items-center gap-1 whitespace-nowrap">
    //           <span className="inline-flex items-center rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-700">
    //             {labels[0]}
    //           </span>
    //           {extra > 0 && (
    //             <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
    //               +{extra}
    //             </span>
    //           )}
    //         </span>
    //       </Tooltip>
    //     )
    //   },
    //   filters: [
    //     { text: 'Late-night food delivery', value: 'late_night_food' },
    //     { text: 'Online shopping sprees', value: 'online_shopping' },
    //     { text: 'Coffee & cafés', value: 'coffee_cafes' },
    //     { text: 'Entertainment', value: 'entertainment' },
    //     { text: 'Something else', value: 'other' },
    //   ],
    //   onFilter: (value, u) =>
    //     u.onboarding.challenges.includes(value as SpendChallenge),
    // },
    {
      title: 'Joined',
      key: 'joinedAt',
      render: (_, u) => (
        <span
          className="whitespace-nowrap text-sm text-gray-700"
          title={u.createdAt}
        >
          {relativeFromNow(u.createdAt).label}
        </span>
      ),
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
    // {
    //   title: 'Last active',
    //   dataIndex: 'lastActiveAt',
    //   key: 'lastActiveAt',
    //   render: (date: string) => {
    //     const { label, tone } = relativeFromNow(date)
    //     return (
    //       <div>
    //         <div
    //           className={`text-sm font-medium ${
    //             tone === 'red'
    //               ? 'text-red-600'
    //               : tone === 'amber'
    //                 ? 'text-amber-600'
    //                 : 'text-gray-900'
    //           }`}
    //         >
    //           {label}
    //         </div>
    //         <div className="text-[11px] text-gray-500">{date}</div>
    //       </div>
    //     )
    //   },
    //   sorter: (a, b) => a.lastActiveAt.localeCompare(b.lastActiveAt),
    //   defaultSortOrder: 'descend',
    // },
    {
      title: 'Email',
      key: 'emailVerified',
      render: (_, u) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            u.verified
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {u.verified ? (
            <>
              <CheckCircle2 size={11} />
              Verified
            </>
          ) : (
            <>
              <AlertTriangle size={11} />
              Unverified
            </>
          )}
        </span>
      ),
      filters: [
        { text: 'Verified', value: true },
        { text: 'Unverified', value: false },
      ],
      onFilter: (value, u) => u.verified === value,
    },
    // {
    //   title: 'Sign-up',
    //   key: 'auth',
    //   render: (_, u) => (
    //     <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
    //       {u.authProvider === 'google' ? (
    //         <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600">
    //           G
    //         </span>
    //       ) : (
    //         <KeyRound size={14} className="text-gray-500" />
    //       )}
    //       {authProviderLabels[u.authProvider]}
    //     </span>
    //   ),
    //   filters: [
    //     { text: 'Google', value: 'google' },
    //     { text: 'Email & password', value: 'email' },
    //   ],
    //   onFilter: (value, u) => u.authProvider === value,
    // },
    {
      title: 'Status',
      key: 'status',
      align: 'right',
      fixed: 'right',
      width: 120,
      render: (_, u) => {
        const mappedStatus = mapStatus(u.status)
        // return <StatusBadge status={mappedStatus} />
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          mappedStatus === 'active' ? 'bg-green-100 text-green-700' :
          mappedStatus === 'restricted' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {mappedStatus}
        </span>
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Restricted', value: 'restricted' },
        { text: 'Banned', value: 'banned' },
      ],
      onFilter: (value, u) => mapStatus(u.status) === value,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      align: 'right',
      fixed: 'right',
      render: (_, u) => {
        const mappedStatus = mapStatus(u.status)
        return (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'view',
                icon: <Eye size={14} />,
                label: <Link to={`/dashboard/users/${u._id}`}>View details</Link>,
              },
              {
                key: 'edit',
                icon: <Pencil size={14} />,
                label: 'Edit profile',
                onClick: () => setEditingUser(u),
              },
              { type: 'divider' },
              ...(mappedStatus !== 'active'
                ? [
                    {
                      key: 'activate',
                      icon: <UserCheck size={14} />,
                      label: 'Reinstate',
                      onClick: () =>
                        confirmStatusChange(u, 'active', 'Reinstate'),
                    },
                  ]
                : []),
              ...(mappedStatus !== 'restricted'
                ? [
                    {
                      key: 'restrict',
                      icon: <CircleSlash size={14} />,
                      label: 'Restrict',
                      onClick: () =>
                        confirmStatusChange(u, 'restricted', 'Restrict'),
                    },
                  ]
                : []),
              ...(mappedStatus !== 'banned'
                ? [
                    {
                      key: 'ban',
                      icon: <Ban size={14} />,
                      label: <span className="text-red-600">Ban user</span>,
                      onClick: () => confirmStatusChange(u, 'banned', 'Ban'),
                    },
                  ]
                : []),
            ],
          }}
        >
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
            aria-label="User actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      )},
    },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert
        message="Error loading users"
        description={error instanceof Error ? error.message : 'An unknown error occurred'}
        type="error"
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage accounts, monitor spend locks, and review rule breaches.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard label="Total users" value={counts.total} icon={UserCheck} />
        <SummaryCard
          label="Active locks"
          value={counts.locked}
          icon={Lock}
          tone="brand"
        />
        <SummaryCard
          label="Breached"
          value={counts.breached}
          icon={ShieldAlert}
          tone="red"
        />
        <SummaryCard
          label="Bank blocked"
          value={counts.bankBlocked}
          icon={Landmark}
          tone="amber"
        />
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[320px]"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'restricted', label: 'Restricted' },
              { value: 'banned', label: 'Banned' },
            ]}
          />
          {/* <Select
            value={lockFilter}
            onChange={setLockFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All lock states' },
              { value: 'unlocked', label: 'Unlocked' },
              { value: 'locked', label: 'Locked' },
              { value: 'breached', label: 'Breached' },
            ]}
          /> */}
          <span className="ml-auto text-xs text-gray-500">
            Showing {filtered.length} of {users.length}
          </span>
        </div>

        <Table<User>
          className="dashboard-table"
          rowKey="_id"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 'max-content' }}
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </section>

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
      />
    </div>
  )
}

type Tone = 'neutral' | 'brand' | 'amber' | 'red'

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  brand: 'bg-brand/10 text-brand',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: number
  icon: typeof UserCheck
  tone?: Tone
}) {
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
    </div>
  )
}
