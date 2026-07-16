import { useEffect, useState } from 'react'
import { App, Input, Modal, Select } from 'antd'
import {
  roleLabels,
  type AdminAccount,
  type AdminRole,
} from './adminsData'
import { useCreateUserMutation, useUpdateUserMutation } from '../../redux/apiSlices/userSlice'

type Mode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: Mode
  admin?: AdminAccount | null
  onClose: () => void
}

const emptyState = {
  name: '',
  email: '',
  phone: '',
  role: 'admin' as AdminRole,
  password: '',
}

export default function AdminFormModal({
  open,
  mode,
  admin,
  onClose,
}: Props) {
  const { message } = App.useApp()
  const [name, setName] = useState(emptyState.name)
  const [email, setEmail] = useState(emptyState.email)
  const [phone, setPhone] = useState(emptyState.phone)
  const [role, setRole] = useState<AdminRole>(emptyState.role)
  const [password, setPassword] = useState(emptyState.password)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && admin) {
      setName(admin.name)
      setEmail(admin.email)
      setPhone(admin.phone ?? '')
      setRole(admin.role)
      setPassword('')
    } else {
      setName(emptyState.name)
      setEmail(emptyState.email)
      setPhone(emptyState.phone)
      setRole(emptyState.role)
      setPassword('')
    }
  }, [open, mode, admin])

  const onRoleChange = (next: AdminRole) => {
    setRole(next)
  }

  const [createUser] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()

  const submit = async () => {
    if (!name.trim()) return message.warning('Name is required.')
    if (!email.trim()) return message.warning('Email is required.')
    if (!email.includes('@')) return message.warning('Enter a valid email.')
    if (mode === 'create' && password.length < 8)
      return message.warning('Password must be at least 8 characters.')

    try {
      if (mode === 'create') {
        await createUser({
          name: name.trim(),
          email: email.trim(),
          mobile: phone.trim() || undefined,
          password: password,
          role,
          permissions: [],
          verified: true,
          auth_provider: 'local',
        }).unwrap()
        message.success('Admin account created.')
      } else if (admin) {
        await updateUser({
          id: admin.id,
          data: {
            name: name.trim(),
            email: email.trim(),
            mobile: phone.trim() || undefined,
            role,
            permissions: [],
          },
        }).unwrap()
        message.success('Admin updated.')
      }
      onClose()
    } catch (err: any) {
      message.error(err?.data?.message || 'Failed to save admin account.')
    }
  }

  const isSuper = mode === 'edit' && admin?.role === 'super_admin'

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Create admin account' : `Edit ${admin?.name}`}
      okText={mode === 'create' ? 'Create account' : 'Save changes'}
      onOk={submit}
      onCancel={onClose}
      width={680}
      destroyOnClose
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Renata Salinas"
            />
          </Field>
          <Field label="Phone (optional)">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (212) 555-0142"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@spendlock.com"
            />
          </Field>
          {mode === 'create' && (
            <Field label="Temporary password">
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </Field>
          )}
        </div>

        <Field label="Role">
          <Select
            value={role}
            onChange={onRoleChange}
            disabled={isSuper}
            style={{ width: '100%' }}
            options={(Object.keys(roleLabels) as AdminRole[]).map((r) => ({
              value: r,
              label: roleLabels[r],
            }))}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Picking a role defines the administrative access level.
          </p>
        </Field>
      </div>
    </Modal>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  )
}
