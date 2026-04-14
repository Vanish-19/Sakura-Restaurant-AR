import { CarOutlined, RestOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'

export default function ServiceTypeModal({ open, onSelect, onClose }) {
  return (
    <Modal
      open={open}
      title={<div className="text-center text-2xl font-bold">Chọn hình thức phục vụ</div>}
      onCancel={onClose}
      footer={null}
      centered
      width={640}
      closable={false}
      maskClosable={false}
      keyboard={false}
    >
      <p className="mb-6 text-center text-slate-500">
        Vui lòng chọn cách nhận món phù hợp với bạn.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
            <RestOutlined />
          </div>
          <div className="text-xl font-semibold text-slate-900">Ăn tại chỗ</div>
          <p className="mt-2 text-sm text-slate-500">
            Phục vụ tại bàn dành cho khách dùng bữa tại nhà hàng.
          </p>
          <Button className="mt-4 !border-0 !bg-[#c0001c] !text-white hover:!bg-[#d1142f]" onClick={() => onSelect('dine-in')}>
            Chọn hình thức này
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
            <CarOutlined />
          </div>
          <div className="text-xl font-semibold text-slate-900">Giao tận nơi</div>
          <p className="mt-2 text-sm text-slate-500">
            Đơn hàng sẽ được giao đến địa chỉ bạn cung cấp.
          </p>
          <Button className="mt-4 !border-0 !bg-[#c0001c] !text-white hover:!bg-[#d1142f]" onClick={() => onSelect('delivery')}>
            Chọn hình thức này
          </Button>
        </div>
      </div>
    </Modal>
  )
}
