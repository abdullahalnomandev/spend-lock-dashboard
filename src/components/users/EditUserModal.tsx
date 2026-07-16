import { useEffect, useState } from 'react'
import { Modal, Form, Input, App } from 'antd'
// import { updateUser } from './usersStore'
import type { User } from '../../redux/apiSlices/userSlice'
import { useUpdateUserMutation } from '../../redux/apiSlices/userSlice'
import type { OldUserRecord } from './usersData'

type Props = {
  user: User | OldUserRecord | null
  onClose: () => void
}

type FormValues = {
  name: string
  email?: string
  mobile?: string
  // address: string
  // city: string
  // country: string
}

/**
 * Phone validation — US / +1 format. Tolerates the usual paste noise
 * (spaces, hyphens, parentheses, dots, a leading +) but rejects junk like
 * "abc" and numbers that are not a valid US length. All users are US-based
 * since the +1 migration.
 */
function validatePhone(_: unknown, value: string) {
  const v = (value || '').trim()
  if (!v) return Promise.reject(new Error('Phone is required'))
  const digits = v.replace(/[\s.()+-]/g, '')
  if (!/^\d+$/.test(digits)) {
    return Promise.reject(
      new Error('Phone can contain only digits and + ( ) - . spaces'),
    )
  }
  const national =
    digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (national.length !== 10) {
    return Promise.reject(
      new Error('Enter a valid US phone number, e.g. +1 (213) 555-0142'),
    )
  }
  return Promise.resolve()
}

export default function EditUserModal({ user, onClose }: Props) {
  const [form] = Form.useForm<FormValues>()
  const { message } = App.useApp()
  const [submitting, setSubmitting] = useState(false)
  const [updateUserMutation] = useUpdateUserMutation()
  // import { updateUser } from './usersStore'

  useEffect(() => {
    if (user) {
      // Check if it's an OldUserRecord (has id instead of _id)
      if ('id' in user) {
        form.setFieldsValue({
          name: user.name,
          email: user.email,
          mobile: (user as any).phone,
          // address: user.address,
          // city: user.city,
          // country: user.country,
        })
      } else {
        // It's a new User type
        form.setFieldsValue({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          // address: user.address,
          // city: user.city,
          // country: user.country,
        })
      }
    }
  }, [user, form])

  const handleSubmit = async () => {
    if (!user) return
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      // Check if it's a new User type
      if ('_id' in user) {
        await updateUserMutation({ id: user._id, data: values }).unwrap()
        message.success('User updated.')
      } else {
        // It's an OldUserRecord - use the old updateUser function
        // import { updateUser } from './usersStore'
        // updateUser(user.id, { name: values.name, email: values.email, phone: values.mobile })
        message.success('User updated (local store).')
      }
      onClose()
    } catch (err) {
      message.error('Failed to update user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!user}
      title={user ? `Edit ${user.name}` : 'Edit user'}
      okText="Save changes"
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form
        layout="vertical"
        form={form}
        requiredMark={false}
        validateTrigger={['onBlur', 'onChange']}
      >
        <Form.Item
          label="Full name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: false, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="mobile"
          required={false}
        >
          <Input placeholder="+1 (213) 555-0142" />
        </Form.Item>
        {/* <Form.Item label="Address" name="address">
          <Input />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="City" name="city">
            <Input />
          </Form.Item>
          <Form.Item label="Country" name="country">
            <Input />
          </Form.Item>
        </div> */}
      </Form>
    </Modal>
  )
}
