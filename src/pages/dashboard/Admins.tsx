import { useMemo, useState } from 'react'
import { App, Dropdown, Input, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  MoreHorizontal,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import {
  useGetAdminUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../../redux/apiSlices/userSlice'
import {
  roleLabels,
  type AdminAccount,
  type AdminRole,
  type AdminStatus,
} from '../../components/admins/adminsData'
import AdminFormModal from '../../components/admins/AdminFormModal'

type StatusFilter = 'all' | AdminStatus
type RoleFilter = 'all' | AdminRole

const roleStyles: Record<AdminRole, string> = {
  super_admin: 'bg-brand/10 text-brand ring-brand/20',
  admin: 'bg-blue-100 text-blue-700 ring-blue-200',
}

const statusStyles: Record<AdminStatus, string> = {
  active: 'bg-green-100 text-green-700 ring-green-200',
  suspended: 'bg-gray-100 text-gray-700 ring-gray-200',
}

export default function Admins() {
  const { modal, message } = App.useApp()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminAccount | null>(null)

  // API hooks
  const { data: response, isLoading } = useGetAdminUsersQuery({
    page,
    limit,
    role: roleFilter === 'all' ? undefined : roleFilter,
    searchTerm: search.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()

  const mappedAdmins = useMemo(() => {
    if (!response?.data) return []
    return response.data.map((user: any) => {
      return {
        id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.mobile || '',
        avatarUrl: user.image,
        role: (user.role || 'admin') as AdminRole,
        status: user.status === 'suspended' ? 'suspended' : 'active',
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : '',
        lastActiveAt: user.updatedAt ? new Date(user.updatedAt).toISOString().slice(0, 16).replace('T', ' ') : undefined,
      } as AdminAccount
    })
  }, [response])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (a: AdminAccount) => {
    setEditing(a)
    setModalOpen(true)
  }

  const toggleStatus = (a: AdminAccount) => {
    if (a.role === 'super_admin') {
      message.warning('Super Admin cannot be suspended.')
      return
    }
    const nextStatus: AdminStatus = a.status === 'active' ? 'suspended' : 'active'
    const verb = nextStatus === 'suspended' ? 'Suspend' : 'Reactivate'
    modal.confirm({
      title: `${verb} ${a.name}?`,
      content:
        nextStatus === 'suspended'
          ? 'A suspended admin will lose access until reactivated.'
          : 'This admin will regain access to the panel.',
      okText: verb,
      okButtonProps: nextStatus === 'suspended' ? { danger: true } : undefined,
      onOk: async () => {
        try {
          await updateUser({ id: a.id, data: { status: nextStatus } }).unwrap()
          message.success(`${a.name} is now ${nextStatus === 'suspended' ? 'suspended' : 'active'}.`)
        } catch (err: any) {
          message.error(err?.data?.message || 'Failed to update status.')
        }
      },
    })
  }

  const remove = (a: AdminAccount) => {
    if (a.role === 'super_admin') {
      message.warning('Super Admin cannot be deleted.')
      return
    }
    modal.confirm({
      title: `Delete ${a.name}?`,
      content: 'This admin account will be removed permanently.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUser(a.id).unwrap()
          message.success(`${a.name} deleted.`)
        } catch (err: any) {
          message.error(err?.data?.message || 'Failed to delete admin.')
        }
      },
    })
  }

  const columns: ColumnsType<AdminAccount> = [
    {
      title: 'Admin',
      key: 'admin',
      render: (_, a) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold text-gray-700">
            {a.avatarUrl ? (
              <img
                src={a.avatarUrl}
                alt={a.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              a.name.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              {a.name}
            </div>
            <div className="truncate text-xs text-gray-500">{a.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, a) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${roleStyles[a.role]}`}
        >
          {roleLabels[a.role]}
        </span>
      ),
      filters: (Object.keys(roleLabels) as AdminRole[]).map((r) => ({
        text: roleLabels[r],
        value: r,
      })),
      onFilter: (value, a) => a.role === value,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, a) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[a.status]}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              a.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {a.status === 'active' ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      title: 'Last active',
      key: 'lastActive',
      render: (_, a) => (
        <span className="text-xs text-gray-500">
          {a.lastActiveAt ?? 'Never signed in'}
        </span>
      ),
      sorter: (a, b) => (a.lastActiveAt ?? '').localeCompare(b.lastActiveAt ?? ''),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, a) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <Pencil size={14} />,
                label: 'Edit',
                onClick: () => openEdit(a),
              },
              {
                key: 'status',
                icon:
                  a.status === 'active' ? (
                    <PauseCircle size={14} />
                  ) : (
                    <PlayCircle size={14} />
                  ),
                label: a.status === 'active' ? 'Suspend' : 'Reactivate',
                onClick: () => toggleStatus(a),
                disabled: a.role === 'super_admin',
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <Trash2 size={14} />,
                label: <span className="text-red-600">Delete</span>,
                onClick: () => remove(a),
                disabled: a.role === 'super_admin',
              },
            ],
          }}
        >
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
            aria-label="Admin actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage staff accounts so your team can access the admin panel.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          <Plus size={16} />
          Add admin
        </button>
      </header>

      <section className="rounded-2xl border border-surface-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-surface-border p-4">
          <Input
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name, email, or phone"
            prefix={<Search size={16} className="text-gray-400" />}
            className="max-w-[320px]"
          />
          <Select
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val)
              setPage(1)
            }}
            style={{ width: 170 }}
            options={[
              { value: 'all', label: 'All roles' },
              ...(Object.keys(roleLabels) as AdminRole[]).map((r) => ({
                value: r,
                label: roleLabels[r],
              })),
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
          <span className="ml-auto text-xs text-gray-500">
            Showing {mappedAdmins.length} of {response?.pagination?.total || 0}
          </span>
        </div>

        <Table<AdminAccount>
          className="dashboard-table"
          rowKey="id"
          columns={columns}
          dataSource={mappedAdmins}
          loading={isLoading}
          pagination={
            response?.pagination && response.pagination.total > limit
              ? {
                  current: page,
                  pageSize: limit,
                  total: response.pagination.total,
                  onChange: (p) => setPage(p),
                }
              : false
          }
        />
      </section>

      <AdminFormModal
        open={modalOpen}
        mode={editing ? 'edit' : 'create'}
        admin={editing}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
