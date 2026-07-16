import { useEffect, useState } from 'react'
import { App, Form, InputNumber, Modal, Switch } from 'antd'
// --- Commented out unused imports ---
// import {
//   packTierLabels,
//   type PackTier,
// } from './coinPackagesData'
import type { CoinPackage } from './coinPackagesData'
// import { createCoinPackage, updateCoinPackage } from './coinPackagesStore'
import { 
  useCreatePackageMutation, 
  useUpdatePackageMutation 
} from '../../redux/apiSlices/packageSlice'

type Mode = 'create' | 'edit'

type Props = {
  open: boolean
  mode: Mode
  pkg?: CoinPackage | null
  onClose: () => void
}

// --- Updated form values to match API ---
type FormValues = {
  coins: number
  price: number
  discount?: number
  isActive: boolean
}

// --- Commented out tier options ---
// const tierOptions: { value: PackTier; label: string }[] = [
//   { value: 'starter', label: packTierLabels.starter },
//   { value: 'standard', label: packTierLabels.standard },
//   { value: 'premium', label: packTierLabels.premium },
// ]

export default function CoinPackageFormModal({
  open,
  mode,
  pkg,
  onClose,
}: Props) {
  const [form] = Form.useForm<FormValues>()
  const { message } = App.useApp()
  const [submitting, setSubmitting] = useState(false)
  
  // RTK Mutations
  const [createPackage] = useCreatePackageMutation()
  const [updatePackage] = useUpdatePackageMutation()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && pkg) {
      form.setFieldsValue({
        coins: pkg.coins,
        price: pkg.price,
        discount: pkg.discount,
        isActive: pkg.isActive,
      })
    } 
  }, [open, mode, pkg, form])

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      const payload = {
        coins: values.coins,
        price: values.price,
        discount: values.discount || 0,
        isActive: values.isActive,
      }
      if (mode === 'edit' && pkg) {
        await updatePackage({ id: pkg._id, data: payload }).unwrap()
        message.success(`Package updated.`)
      } else {
        await createPackage(payload).unwrap()
        message.success(`Package created.`)
      }
      onClose()
    } catch (error) {
      message.error('Failed to save package.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? `Edit package` : 'New coin package'}
      okText={mode === 'edit' ? 'Save changes' : 'Create package'}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form layout="vertical" form={form} requiredMark={false}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Coins"
            name="coins"
            rules={[{ required: true, message: 'Coin count required' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item
            label="Price (USD)"
            name="price"
            rules={[{ required: true, message: 'Price required' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              prefix="$"
              className="w-full"
            />
          </Form.Item>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Discount (%)"
            name="discount"
          >
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>
          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>
        {/* --- Commented out unused fields ---
        <Form.Item
          label="Label"
          name="label"
          rules={[{ required: true, message: 'Label required' }]}
        >
          <Input placeholder="e.g. Starter, Most popular, Max" />
        </Form.Item>
        <Form.Item
          label="Badge"
          name="badge"
          tooltip="Small promotional text shown on the pack (optional)"
        >
          <Input placeholder="e.g. Save 25%, Best value" />
        </Form.Item>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Tier"
            name="tier"
            rules={[{ required: true, message: 'Tier required' }]}
          >
            <Select options={tierOptions} />
          </Form.Item>
        </div>
        */}
      </Form>
    </Modal>
  )
}
