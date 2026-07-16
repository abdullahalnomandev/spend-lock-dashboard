import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { App } from 'antd'
import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowLeft,
  Ban,
  Bell,
  CheckCircle2,
  CircleSlash,
  Clock,
  Coins,
  KeyRound,
  Landmark,
  ListChecks,
  LogIn,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plane,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  Target,
  Tv,
  Unlock,
  UserCheck,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import {
  forceUnlock,
  setUserStatus,
  useUser,
} from '../../components/users/usersStore'
import {
  authProviderLabels,
  lockCategoryLabels,
  lockPeriodLabels,
  lockTypeLabels,
  reminderPrefLabels,
  ruleProgress,
  ruleTimeRemainingMs,
  savingsGoalLabels,
  spendChallengeLabels,
  spendLockSummary,
  type ActivityRecord,
  type ActivityType,
  type SpendRule,
  type UserStatus,
} from '../../components/users/usersData'
import StatusBadge from '../../components/users/StatusBadge'
import LockStatusBadge from '../../components/users/LockStatusBadge'
import EditUserModal from '../../components/users/EditUserModal'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatTimeRemaining(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000)
  const days = Math.floor(totalMinutes / (60 * 24))
  if (days >= 1) return `${days}d left`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}h left`
}

export default function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const user = useUser(id)
  const navigate = useNavigate()
  const { modal, message } = App.useApp()
  const [editing, setEditing] = useState(false)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-base text-gray-700">User not found.</p>
        <Link
          to="/dashboard/users"
          className="text-sm font-medium text-brand hover:underline"
        >
          Back to users
        </Link>
      </div>
    )
  }

  const ob = user.onboarding
  const sl = user.spendLock
  const slSummary = spendLockSummary(user)
  const activeRules = sl.rules.filter((r) => r.active)

  const confirmStatusChange = (status: UserStatus, label: string) => {
    modal.confirm({
      title: `${label} ${user.name}?`,
      content:
        status === 'banned'
          ? 'Banned users cannot sign in or manage their spend locks.'
          : status === 'restricted'
            ? 'Restricted users can sign in but cannot change lock settings.'
            : 'This user will regain full access to the app.',
      okText: label,
      okButtonProps: status === 'banned' ? { danger: true } : undefined,
      onOk: () => {
        setUserStatus(user.id, status)
        message.success(`${user.name} is now ${status}.`)
      },
    })
  }

  const confirmPasswordReset = () => {
    modal.confirm({
      title: `Reset password for ${user.name}?`,
      content: (
        <span>
          A new password will be generated on the server and emailed to{' '}
          <span className="font-medium text-gray-900">{user.email}</span>. The
          user must use the new password on their next sign-in.
        </span>
      ),
      okText: 'Send reset email',
      onOk: () => {
        message.success(`Password reset email sent to ${user.email}.`)
      },
    })
  }

  const confirmForceUnlock = () => {
    modal.confirm({
      title: `Force unlock ${user.name}?`,
      content:
        'This clears every rule breach, unblocks their bank accounts, and restores blocked apps. Use only for verified support cases.',
      okText: 'Force unlock',
      onOk: () => {
        forceUnlock(user.id)
        message.success(`${user.name}'s spend lock was lifted.`)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/users')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to users
        </button>
      </div>

      <section className="rounded-2xl border border-surface-border bg-surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-xl font-semibold text-gray-700">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {user.name}
                </h1>
                <StatusBadge status={user.status} />
                <LockStatusBadge status={sl.status} />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Joined {user.joinedAt} · Last active {user.lastActiveAt}
              </p>
              {user.statusNote && (
                <p className="mt-2 max-w-xl text-xs text-gray-600">
                  <span className="font-semibold">Note:</span> {user.statusNote}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={confirmPasswordReset}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-gray-800 hover:bg-surface-elevated"
            >
              <KeyRound size={14} />
              Reset password
            </button>
            {user.status !== 'active' && (
              <button
                type="button"
                onClick={() => confirmStatusChange('active', 'Reinstate')}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
              >
                <UserCheck size={14} />
                Reinstate
              </button>
            )}
            {user.status !== 'restricted' && (
              <button
                type="button"
                onClick={() => confirmStatusChange('restricted', 'Restrict')}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600"
              >
                <CircleSlash size={14} />
                Restrict
              </button>
            )}
            {user.status !== 'banned' && (
              <button
                type="button"
                onClick={() => confirmStatusChange('banned', 'Ban')}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Ban size={14} />
                Ban
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ContactRow
            icon={Mail}
            label="Email"
            value={user.email}
            trailing={
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  user.emailVerified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </span>
            }
          />
          <ContactRow icon={Phone} label="Phone" value={user.phone} />
          <ContactRow
            icon={MapPin}
            label="Address"
            value={`${user.address}, ${user.city}, ${user.country}`}
          />
          <ContactRow
            icon={LogIn}
            label="Sign-in method"
            value={authProviderLabels[user.authProvider]}
          />
        </div>
      </section>

      {/* ─── Onboarding profile ──────────────────────────────── */}
      <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-brand" />
            <h2 className="text-base font-semibold text-gray-900">
              Onboarding profile
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            Completed {ob.completedAt}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Captured in the setup flow right after registration.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoTile label="Primary goal" value={savingsGoalLabels[ob.goal]} />
          <InfoTile
            label="Self-set monthly budget"
            value={currency.format(ob.monthlyBudget)}
          />
          <div
            className={`rounded-xl border p-3 ${
              ob.bankConnected
                ? 'border-green-200 bg-green-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Bank connection
            </div>
            <div
              className={`mt-0.5 flex items-center gap-1.5 text-sm font-medium ${
                ob.bankConnected ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              {ob.bankConnected ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              {ob.bankConnected ? 'Connected' : 'Not connected'}
            </div>
            {!ob.bankConnected && (
              <div className="mt-0.5 text-xs text-amber-600">
                Spend locks cannot be enforced until a bank is linked.
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Biggest spending challenges
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ob.challenges.map((c) => (
                <Chip key={c}>{spendChallengeLabels[c]}</Chip>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Reminders enabled
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ob.reminders.length === 0 ? (
                <span className="text-sm text-gray-500">
                  No reminders enabled.
                </span>
              ) : (
                ob.reminders.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-gray-700"
                  >
                    <Bell size={11} className="text-gray-500" />
                    {reminderPrefLabels[r]}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* Active rules */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-brand" />
              <h2 className="text-base font-semibold text-gray-900">
                Active rules
              </h2>
              <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                {activeRules.length}
              </span>
              <LockStatusBadge status={sl.status} />
            </div>
            {sl.status !== 'unlocked' && (
              <button
                type="button"
                onClick={confirmForceUnlock}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 text-sm font-medium text-gray-800 hover:bg-surface-elevated"
              >
                <Unlock size={14} />
                Force unlock
              </button>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Spend locks the user has configured. {slSummary.totalRuleCount - activeRules.length > 0 && `${slSummary.totalRuleCount - activeRules.length} paused.`}
          </p>

          {sl.rules.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-surface-border p-6 text-center text-sm text-gray-500">
              No rules configured. This user hasn't set up any spend locks.
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {sl.rules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))}
            </ul>
          )}
        </div>

        {/* Blocked services */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
          <h2 className="text-base font-semibold text-gray-900">
            Blocked services
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Consequences applied when a rule is broken.
          </p>

          <div
            className={`mt-4 flex items-start gap-3 rounded-xl border p-3 ${
              sl.bankBlocked
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 bg-green-50'
            }`}
          >
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                sl.bankBlocked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              <Landmark size={16} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900">
                Bank transactions
              </div>
              <div className="text-xs text-gray-600">
                {sl.bankBlocked
                  ? `Blocked since ${sl.blockedSince ?? '—'}`
                  : 'Active — payments allowed'}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Blocked apps
            </div>
            {sl.blockedApps.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No apps blocked.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sl.blockedApps.map((app) => (
                  <span
                    key={app.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200"
                  >
                    <Smartphone size={11} />
                    {app.name}
                    <span className="text-red-400">
                      · {lockCategoryLabels[app.category]}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border p-5">
          <div className="flex items-center gap-2">
            <ActivityIcon size={16} className="text-brand" />
            <h2 className="text-base font-semibold text-gray-900">
              Activity log
            </h2>
            <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
              {user.activities.length}
            </span>
          </div>
          <p className="text-xs text-gray-500">Newest events first.</p>
        </div>
        {user.activities.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No activity recorded.</p>
        ) : (
          <ul className="divide-y divide-surface-border px-5">
            {[...user.activities]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
          </ul>
        )}
      </section>

      <EditUserModal
        user={editing ? user : null}
        onClose={() => setEditing(false)}
      />
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  trailing,
}: {
  icon: LucideIcon
  label: string
  value: string
  trailing?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-elevated p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate text-sm text-gray-900">{value}</span>
          {trailing}
        </div>
      </div>
    </div>
  )
}

function Chip({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'brand'
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        tone === 'brand'
          ? 'bg-brand/10 text-brand'
          : 'bg-surface-elevated text-gray-700'
      }`}
    >
      {children}
    </span>
  )
}

function InfoTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-elevated p-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-gray-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-500">{hint}</div>}
    </div>
  )
}

const categoryIcon: Record<SpendRule['categories'][number], LucideIcon> = {
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  entertainment: Tv,
  travel: Plane,
}

function RuleCard({ rule }: { rule: SpendRule }) {
  const progress = ruleProgress(rule)
  const overLimit =
    rule.type === 'limit' &&
    (rule.spentThisPeriod ?? 0) > (rule.limitAmount ?? 0)
  const remainingMs = ruleTimeRemainingMs(rule)
  const PrimaryCategoryIcon = categoryIcon[rule.categories[0] ?? 'shopping']
  const isTime = rule.type === 'time'

  return (
    <li
      className={`rounded-xl border bg-white p-4 ${
        rule.active ? 'border-surface-border' : 'border-dashed border-surface-border opacity-70'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isTime
              ? 'bg-violet-50 text-violet-600'
              : 'bg-amber-50 text-amber-600'
          }`}
        >
          <PrimaryCategoryIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                {rule.name}
              </div>
              <div className="mt-0.5 text-xs text-gray-500">
                {isTime
                  ? `${rule.startsAt ?? '—'} → ${rule.endsAt ?? '—'}`
                  : `${lockPeriodLabels[rule.period ?? 'monthly']} · ${currency.format(rule.limitAmount ?? 0)} cap`}
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isTime
                  ? 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
              }`}
            >
              {isTime ? <Clock size={11} /> : <Wallet size={11} />}
              {lockTypeLabels[rule.type]}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {rule.categories.map((c) => (
              <Chip key={c}>{lockCategoryLabels[c]}</Chip>
            ))}
          </div>

          {rule.targetApps.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Smartphone size={11} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                Locks {rule.targetApps.length}{' '}
                {rule.targetApps.length === 1 ? 'app' : 'apps'}:
              </span>
              {rule.targetApps.map((app) => (
                <span
                  key={app.name}
                  className="inline-flex items-center rounded-full bg-surface-elevated px-2 py-0.5 text-[11px] font-medium text-gray-700"
                >
                  {app.name}
                </span>
              ))}
            </div>
          )}

          {rule.type === 'limit' && rule.limitAmount ? (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Spent this {lockPeriodLabels[rule.period ?? 'monthly'].toLowerCase()}
                </span>
                <span className="font-semibold text-gray-900">
                  {currency.format(rule.spentThisPeriod ?? 0)}
                  <span className="text-gray-400">
                    {' / '}
                    {currency.format(rule.limitAmount)}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className={`h-full rounded-full ${
                    overLimit
                      ? 'bg-red-500'
                      : (progress ?? 0) >= 80
                        ? 'bg-amber-500'
                        : 'bg-brand'
                  }`}
                  style={{ width: `${progress ?? 0}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isTime && remainingMs !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <Clock size={11} />
                {formatTimeRemaining(remainingMs)}
              </span>
            )}
            {isTime && remainingMs === null && rule.endsAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                Ended
              </span>
            )}
            {rule.type === 'limit' && rule.savedAmount !== undefined && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                  rule.savedAmount >= 0
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    : 'bg-red-50 text-red-700 ring-red-200'
                }`}
              >
                {rule.savedAmount >= 0
                  ? `${currency.format(rule.savedAmount)} saved`
                  : `Over by ${currency.format(Math.abs(rule.savedAmount))}`}
              </span>
            )}
            {!rule.active && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                Paused
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

type ActivityTone = 'gray' | 'green' | 'red' | 'amber' | 'brand' | 'violet' | 'blue'

const activityToneClass: Record<ActivityTone, string> = {
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  amber: 'bg-amber-100 text-amber-600',
  brand: 'bg-brand/10 text-brand',
  violet: 'bg-violet-100 text-violet-600',
  blue: 'bg-blue-100 text-blue-600',
}

const activityVisual: Record<
  ActivityType,
  { icon: LucideIcon; tone: ActivityTone; label: string }
> = {
  login: { icon: LogIn, tone: 'blue', label: 'Login' },
  login_failed: { icon: AlertTriangle, tone: 'red', label: 'Failed login' },
  logout: { icon: LogIn, tone: 'gray', label: 'Logout' },
  email_verified: { icon: CheckCircle2, tone: 'green', label: 'Email verified' },
  password_reset: { icon: KeyRound, tone: 'amber', label: 'Password reset' },
  profile_updated: { icon: Pencil, tone: 'gray', label: 'Profile updated' },
  bank_linked: { icon: Landmark, tone: 'green', label: 'Bank linked' },
  rule_created: { icon: ListChecks, tone: 'brand', label: 'Rule created' },
  rule_paused: { icon: ListChecks, tone: 'gray', label: 'Rule paused' },
  rule_breached: { icon: AlertTriangle, tone: 'red', label: 'Rule breached' },
  coins_purchased: { icon: Coins, tone: 'amber', label: 'Coins purchased' },
  coins_spent: { icon: Unlock, tone: 'amber', label: 'Coins spent' },
  force_unlock: { icon: Unlock, tone: 'brand', label: 'Force unlock' },
  status_changed: { icon: ShieldAlert, tone: 'violet', label: 'Status changed' },
  order_placed: { icon: ShoppingBag, tone: 'gray', label: 'Order placed' },
}

function ActivityRow({ activity }: { activity: ActivityRecord }) {
  const { icon: Icon, tone, label } = activityVisual[activity.type]
  const meta = [
    activity.device,
    activity.location,
    activity.byAdmin && `by ${activity.byAdmin}`,
  ].filter(Boolean)
  return (
    <li className="flex items-start gap-3 py-3">
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activityToneClass[tone]}`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {activity.description}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${activityToneClass[tone]}`}
          >
            {label}
          </span>
        </div>
        {meta.length > 0 && (
          <div className="mt-0.5 text-xs text-gray-500">{meta.join(' · ')}</div>
        )}
      </div>
      <div className="shrink-0 text-xs text-gray-500">{activity.at}</div>
    </li>
  )
}
