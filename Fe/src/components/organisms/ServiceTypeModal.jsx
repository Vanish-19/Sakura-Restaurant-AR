import { CarOutlined, RestOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'

export default function ServiceTypeModal({ open, onSelect, onClose }) {
  return (
    <Modal
      open={open}
      title={<div className="text-center text-2xl font-bold">Choose Service Type</div>}
      onCancel={onClose}
      footer={null}
      centered
      width={640}
      closable={false}
      maskClosable={false}
      keyboard={false}
    >
      <p className="mb-6 text-center text-slate-500">
        Select the delivery method for your order.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
            <RestOutlined />
          </div>
          <div className="text-xl font-semibold text-slate-900">Dine-in</div>
          <p className="mt-2 text-sm text-slate-500">
            Table service for guests dining at the Kyoto Gastronomic.
          </p>
          <Button className="mt-4 !border-0 !bg-[#c0001c] !text-white hover:!bg-[#d1142f]" onClick={() => onSelect('dine-in')}>
            Select Option
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
            <CarOutlined />
          </div>
          <div className="text-xl font-semibold text-slate-900">Delivery</div>
          <p className="mt-2 text-sm text-slate-500">
            Outbound orders via courier to single-party parties.
          </p>
          <Button className="mt-4 !border-0 !bg-[#c0001c] !text-white hover:!bg-[#d1142f]" onClick={() => onSelect('delivery')}>
            Select Option
          </Button>
        </div>
      </div>
    </Modal>
  )
}
