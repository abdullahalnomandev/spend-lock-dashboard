import { useMemo, useState } from 'react'
import { App, Dropdown, Spin } from 'antd'
import {
  Coins,
  MoreHorizontal,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
} from 'lucide-react'
// --- Commented out unused imports ---
// import {
//   packTierColors,
//   packTierLabels,
//   pricePerCoin,
// } from '../../components/coinPackages/coinPackagesData'
import type { CoinPackage } from '../../components/coinPackages/coinPackagesData'
// import {
//   deleteCoinPackage,
//   toggleCoinPackageActive,
//   useCoinPackages,
// } from '../../components/coinPackages/coinPackagesStore'
import CoinPackageFormModal from '../../components/coinPackages/CoinPackageFormModal'
import {
  useGetPackagesQuery,
  useDeletePackageMutation,
  useUpdatePackageMutation,
} from '../../redux/apiSlices/packageSlice'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// --- Commented out unused per-coin formatter ---
// const perCoinFmt = new Intl.NumberFormat('en-US', {
//   style: 'currency',
//   currency: 'USD',
//   minimumFractionDigits: 2,
//   maximumFractionDigits: 3,
// })

const numberFmt = new Intl.NumberFormat('en-US')

export default function CoinPackages() {
  // Use RTK Query instead of local store
  const { data: packagesData, isLoading, isError } = useGetPackagesQuery({ page: 1, limit: 100 })
  const packages = packagesData?.data || []
  
  const { modal, message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<CoinPackage | null>(null)
  
  // RTK Mutations
  const [deletePackage] = useDeletePackageMutation()
  const [updatePackage] = useUpdatePackageMutation()

  const stats = useMemo(() => {
    const active = packages.filter((p) => p.isActive)
    const prices = active.map((p) => p.price)
    return {
      total: packages.length,
      active: active.length,
      lowest: prices.length ? Math.min(...prices) : 0,
      highest: prices.length ? Math.max(...prices) : 0,
    }
  }, [packages])

  const sorted = useMemo(
    () => [...packages].sort((a, b) => a.price - b.price),
    [packages],
  )

  const handleCreate = () => {
    setEditingPkg(null)
    setModalOpen(true)
  }

  const handleEdit = (pkg: CoinPackage) => {
    setEditingPkg(pkg)
    setModalOpen(true)
  }

  const handleDelete = async (pkg: CoinPackage) => {
    modal.confirm({
      // title: `Delete ${pkg.label} pack?`, // label is unused now
      title: `Delete ${pkg.coins} coins pack?`,
      content:
        'Existing purchases that reference this pack will keep their data, but the pack will no longer be sold in the app.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deletePackage(pkg._id).unwrap()
          message.success(`Pack deleted.`)
        } catch (error) {
          message.error('Failed to delete pack.')
        }
      },
    })
  }

  const handleToggleActive = async (pkg: CoinPackage) => {
    try {
      await updatePackage({ 
        id: pkg._id, 
        data: { isActive: !pkg.isActive } 
      }).unwrap()
      message.success(
        `Pack ${pkg.isActive ? 'paused' : 'activated'}.`,
      )
    } catch (error) {
      message.error('Failed to update pack.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500">Failed to load packages.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Coin packages
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Coin packs users can buy from the app to lift their spend-lock
            blocks.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand/90"
        >
          <Plus size={16} />
          Add package
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryStat label="Total packs" value={`${stats.total}`} />
        <SummaryStat label="Active packs" value={`${stats.active}`} />
        <SummaryStat
          label="Lowest price"
          value={stats.lowest ? currency.format(stats.lowest) : '—'}
        />
        <SummaryStat
          label="Highest price"
          value={stats.highest ? currency.format(stats.highest) : '—'}
        />
      </section>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-12 text-center">
          <Coins size={32} className="mx-auto text-gray-400" />
          <p className="mt-3 text-sm text-gray-600">
            No coin packages yet. Create one to start selling.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((pkg) => (
            <PackageCard
              key={pkg._id}
              pkg={pkg}
              onEdit={() => handleEdit(pkg)}
              onDelete={() => handleDelete(pkg)}
              onToggleActive={() => handleToggleActive(pkg)}
            />
          ))}
        </section>
      )}

      <CoinPackageFormModal
        open={modalOpen}
        mode={editingPkg ? 'edit' : 'create'}
        pkg={editingPkg}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  )
}

function PackageCard({
  pkg,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  pkg: CoinPackage
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  // --- Commented out unused tier color stuff ---
  // const tierColor = packTierColors[pkg.tier]
  
  return (
    <article
      className={`relative flex flex-col gap-3 rounded-2xl border bg-surface-card p-5 ${
        pkg.isActive ? 'border-surface-border' : 'border-dashed border-surface-border opacity-75'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-gray-900 ring-4 ring-amber-100">
            <Coins size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {numberFmt.format(pkg.coins)}
              </span>
              <span className="text-sm text-gray-500">coins</span>
            </div>
            {/* <div className="text-xs text-gray-500">{pkg.label}</div> */}
          </div>
        </div>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                icon: <Pencil size={14} />,
                label: 'Edit',
                onClick: onEdit,
              },
              {
                key: 'toggle',
                icon: pkg.isActive ? <PauseCircle size={14} /> : <PlayCircle size={14} />,
                label: pkg.isActive ? 'Pause' : 'Activate',
                onClick: onToggleActive,
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <Trash2 size={14} />,
                label: <span className="text-red-600">Delete</span>,
                onClick: onDelete,
              },
            ],
          }}
        >
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-surface-elevated hover:text-gray-900"
            aria-label="Pack actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900">
            {currency.format(pkg.price)}
          </div>
          {/* <div className="text-[11px] text-gray-500">
            {perCoinFmt.format(pricePerCoin(pkg))} per coin
          </div> */}
        </div>
        <div className="flex flex-col items-end gap-1">
          {/* --- Commented out unused tier label ---
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: `${tierColor}1a`,
              color: tierColor,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: tierColor }}
            />
            {packTierLabels[pkg.tier]}
          </span>
          */}
          {pkg.discount > 0 && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {pkg.discount}% OFF
            </span>
          )}
          {!pkg.isActive && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              Paused
            </span>
          )}
        </div>
      </div>

      {/* {pkg.badge && (
        <div className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          {pkg.badge}
        </div>
      )} */}
    </article>
  )
}
