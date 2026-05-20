import {
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Popconfirm,
  QRCode,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { buildTableQrUrls, TABLE_QR_BASE_URL } from '../../constants/tableQrRoutes.js'
import { getAllTables, resetTable } from '../../services/adminTableApi.js'

const floorLabelMap = {
  'main hall': 'Sảnh chính',
  'vip lounge': 'Khu VIP',
  terrace: 'Sân thượng',
  window: 'Khu cửa sổ',
}

function toFloorLabel(zone) {
  const normalized = String(zone || '').trim().toLowerCase()
  return floorLabelMap[normalized] || String(zone || 'Không xác định')
}

function extractTableCode(table) {
  const nameDigits = String(table?.name || '').match(/\d+/)?.[0]
  if (nameDigits) return nameDigits.padStart(2, '0')

  const qrDigits = String(table?.qr_hash || '').match(/\d+/)?.[0]
  if (qrDigits) return qrDigits.padStart(2, '0')

  return String(table?.name || '??')
}

function mapTableStatus(status) {
  if (status === 'dining') {
    return {
      key: 'occupied',
      label: 'Đang sử dụng',
      tone: 'red',
      note: 'IN SERVICE',
    }
  }

  if (status === 'reserved') {
    return {
      key: 'reserved',
      label: 'Đã đặt trước',
      tone: 'gold',
      note: 'RESERVED',
    }
  }

  return {
    key: 'available',
    label: 'Bàn trống',
    tone: 'green',
    note: 'READY',
  }
}

function tableStateStyle(state) {
  if (state === 'occupied') return 'border-rose-600 bg-white text-rose-700'
  if (state === 'reserved') return 'border-amber-500 bg-white text-amber-600'
  return 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
}

export default function TableManagementAdminPage() {
  const [query, setQuery] = useState('')
  const [floorFilter, setFloorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedTableForQr, setSelectedTableForQr] = useState(null)
  const qrBaseUrl = TABLE_QR_BASE_URL

  const qrUrlByCode = useMemo(() => {
    const byCode = new Map()
    for (const item of buildTableQrUrls(qrBaseUrl)) {
      byCode.set(item.tableCode, item.url)
    }
    return byCode
  }, [qrBaseUrl])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const res = await getAllTables()
      if (res?.success && Array.isArray(res.data)) {
        setTables(
          res.data.map((table) => {
            const status = mapTableStatus(table.status)
            return {
              id: table._id,
              name: table.name,
              code: extractTableCode(table),
              zone: String(table.zone || 'Main Hall').trim(),
              capacity: table.capacity || 4,
              qrHash: table.qr_hash || '',
              rawStatus: table.status || 'empty',
              state: status.key,
              stateLabel: status.label,
              stateTone: status.tone,
              note: status.note,
            }
          }),
        )
      }
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh sách bàn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const floorOptions = useMemo(() => {
    const zones = Array.from(new Set(tables.map((table) => table.zone).filter(Boolean)))
    return [
      { label: 'Tất cả khu vực', value: 'all' },
      ...zones.map((zone) => ({
        label: toFloorLabel(zone),
        value: String(zone).toLowerCase(),
      })),
    ]
  }, [tables])

  const filteredTables = useMemo(() => {
    const keyword = String(query || '').trim().toLowerCase()

    return tables.filter((table) => {
      const matchesKeyword =
        keyword.length === 0 ||
        table.code.toLowerCase().includes(keyword) ||
        String(table.name || '').toLowerCase().includes(keyword) ||
        String(table.zone || '').toLowerCase().includes(keyword)
      const matchesFloor = floorFilter === 'all' ? true : table.zone.toLowerCase() === floorFilter
      const matchesStatus = statusFilter === 'all' ? true : table.state === statusFilter

      return matchesKeyword && matchesFloor && matchesStatus
    })
  }, [floorFilter, query, statusFilter, tables])

  const availableCount = tables.filter((table) => table.state === 'available').length
  const reservedCount = tables.filter((table) => table.state === 'reserved').length
  const occupiedCount = tables.filter((table) => table.state === 'occupied').length
  const currentUsage = occupiedCount + reservedCount

  const selectedTableQrUrl = useMemo(() => {
    const tableCode = selectedTableForQr?.code || ''
    const normalizedCode = String(tableCode).padStart(2, '0')
    return qrUrlByCode.get(normalizedCode) || `${qrBaseUrl}/order?table=${normalizedCode}`
  }, [qrBaseUrl, qrUrlByCode, selectedTableForQr])

  const openQrModal = (table) => {
    setSelectedTableForQr(table)
    setQrModalOpen(true)
  }

  const handleResetTable = async (id) => {
    try {
      await resetTable(id)
      message.success('Đã reset bàn')
      fetchTables()
    } catch (err) {
      console.error(err)
      message.error(err?.message || 'Không thể reset bàn')
    }
  }

  const columns = [
    {
      title: 'BÀN',
      key: 'table',
      render: (_, row) => (
        <div>
          <div className="font-semibold text-zinc-900">{row.name}</div>
          <div className="text-[11px] text-zinc-500">Mã QR: {row.qrHash || `table-${row.code}`}</div>
        </div>
      ),
    },
    {
      title: 'KHU VỰC',
      dataIndex: 'zone',
      key: 'zone',
      render: (zone) => <Tag>{toFloorLabel(zone)}</Tag>,
    },
    {
      title: 'SỨC CHỨA',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (value) => <span className="text-sm font-medium text-zinc-700">{value} khách</span>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'stateLabel',
      key: 'stateLabel',
      render: (_, row) => <Tag color={row.stateTone}>{row.stateLabel}</Tag>,
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      render: (_, row) => (
        <Space size="small">
          <Button size="small" icon={<QrcodeOutlined />} onClick={() => openQrModal(row)}>
            Xem QR
          </Button>
          <Popconfirm
            title="Reset bàn này về trạng thái trống?"
            onConfirm={() => handleResetTable(row.id)}
            disabled={row.rawStatus === 'empty'}
          >
            <Button size="small" disabled={row.rawStatus === 'empty'}>
              Reset
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="Floor Control"
        title="Quản lý bàn"
        subtitle="Theo dõi tình trạng bàn trống, bàn đã đặt và QR order trong cùng cấu trúc quản trị với blog và các danh mục khác."
        action={
          <Button icon={<ReloadOutlined />} onClick={fetchTables}>
            Làm mới
          </Button>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <AdminStatCard title="MỨC ĐỘ SỬ DỤNG" value={`${currentUsage}/${tables.length || 0}`} note="Bàn đang dùng hoặc đã đặt" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <AdminStatCard title="BÀN TRỐNG" value={availableCount} note="Sẵn sàng đón khách" accent />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <AdminStatCard title="ĐÃ ĐẶT TRƯỚC" value={reservedCount} note="Giữ chỗ chờ khách đến" />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <AdminStatCard title="ĐANG SỬ DỤNG" value={occupiedCount} note="Đang có khách tại bàn" />
        </Col>
      </Row>

      <Card className="admin-panel-card" bodyStyle={{ padding: 0 }}>
        <div className="admin-toolbar">
          <div className="admin-toolbar__meta">
            <h3 className="admin-toolbar__title">Bản đồ và danh mục bàn</h3>
            <p className="admin-toolbar__description">Tra cứu theo khu vực, trạng thái hoặc mã bàn rồi thao tác QR và reset ngay trong một chỗ.</p>
          </div>
          <div className="admin-toolbar__controls">
            <Input
              allowClear
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên bàn, mã QR hoặc khu vực..."
              prefix={<SearchOutlined className="text-zinc-400" />}
              className="admin-toolbar__search"
            />
            <Select value={floorFilter} onChange={setFloorFilter} options={floorOptions} style={{ width: 190 }} />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Bàn trống', value: 'available' },
                { label: 'Đã đặt trước', value: 'reserved' },
                { label: 'Đang sử dụng', value: 'occupied' },
              ]}
              style={{ width: 170 }}
            />
          </div>
        </div>

        <div className="grid gap-4 p-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="!rounded-2xl !border !border-zinc-200 !shadow-none" bodyStyle={{ padding: 18 }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-xl font-bold text-zinc-900">Sơ đồ bàn trực quan</h3>
                <p className="mt-1 mb-0 text-xs text-zinc-500">Chọn một ô để xem QR của bàn tương ứng.</p>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <TeamOutlined className="text-lg" />
              </div>
            </div>

            <div className="min-h-[320px] rounded-2xl bg-[radial-gradient(#efefef_1px,transparent_1px)] bg-[size:16px_16px] p-4">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Spin />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredTables.map((table) => (
                    <div key={table.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => openQrModal(table)}
                        className={`relative flex h-[84px] w-full items-center justify-center rounded-2xl border-2 text-center transition hover:scale-[1.02] ${tableStateStyle(table.state)}`}
                      >
                        <div>
                          <div className="text-[30px] leading-none font-black tracking-tight">{table.code}</div>
                          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{table.note}</div>
                        </div>
                      </button>
                      <div className="text-center text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                        {toFloorLabel(table.zone)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="admin-panel-card admin-spotlight-card" bodyStyle={{ padding: 20 }}>
            <p className="admin-spotlight-card__eyebrow">Bàn đang chọn</p>
            <h3 className="admin-spotlight-card__title">
              {selectedTableForQr ? selectedTableForQr.name : 'Chọn một bàn từ sơ đồ hoặc danh sách'}
            </h3>
            <p className="admin-spotlight-card__meta">
              {selectedTableForQr
                ? `${toFloorLabel(selectedTableForQr.zone)} • ${selectedTableForQr.capacity} khách • ${selectedTableForQr.stateLabel}`
                : 'QR sẽ hiện ở modal riêng để dễ copy và in cho từng vị trí phục vụ.'}
            </p>

            <div className="mt-5 space-y-3">
              {floorOptions
                .filter((option) => option.value !== 'all')
                .map((option) => {
                  const count = tables.filter((table) => table.zone.toLowerCase() === option.value).length
                  return (
                    <div key={option.value} className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{option.label}</div>
                      <div className="mt-1 text-lg font-bold text-zinc-900">{count} bàn</div>
                    </div>
                  )
                })}
            </div>
          </Card>
        </div>

        <div className="px-5 pb-5">
          <Table
            columns={columns}
            dataSource={filteredTables}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 780 }}
          />
        </div>
      </Card>

      <Modal
        title={selectedTableForQr ? `QR bàn ${selectedTableForQr.code}` : 'QR bàn'}
        open={qrModalOpen}
        onCancel={() => {
          setQrModalOpen(false)
          setSelectedTableForQr(null)
        }}
        footer={null}
        centered
      >
        <div className="flex flex-col items-center gap-3">
          <QRCode value={selectedTableQrUrl} size={220} errorLevel="H" />

          <Typography.Text copyable={{ text: selectedTableQrUrl }} className="break-all text-center text-xs text-zinc-600">
            {selectedTableQrUrl}
          </Typography.Text>

          <div className="text-center text-[11px] text-zinc-500">
            Quét mã này để mở giao diện gọi món đúng cho bàn {selectedTableForQr?.code || '--'}.
          </div>
        </div>
      </Modal>
    </div>
  )
}
