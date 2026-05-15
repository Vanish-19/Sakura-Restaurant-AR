import { Card, Col, Row, Tag, message, Button, Space, Tabs, Popconfirm } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { cancelOrder, deleteOrder, getAllOrders, getOrderStats, updateOrderStatus } from '../../services/adminOrderApi.js'

function formatPrice(num) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(num || 0))
}

function formatDateTime(value) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default function OrderManagementAdminPage() {
  const { adminSearchQuery = '' } = useOutletContext() || {}
  const [dineInOrders, setDineInOrders] = useState([])
  const [takeawayOrders, setTakeawayOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const keyword = String(adminSearchQuery || '').trim()
    const commonParams = keyword ? { order_id: keyword } : {}

    try {
      setLoading(true)
      const resDineIn = await getAllOrders({ order_type: 'dine_in', ...commonParams })
      const resTakeaway = await getAllOrders({ order_type: 'takeaway', ...commonParams })
      const resStats = await getOrderStats()

      if (resDineIn?.success) {
        setDineInOrders(resDineIn.orders || [])
      }
      if (resTakeaway?.success) {
        setTakeawayOrders(resTakeaway.orders || [])
      }
      if (resStats?.success) {
        setStats(resStats.data)
      }
    } catch (err) {
      console.error(err)
      message.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [adminSearchQuery])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus)
      message.success(`Đã cập nhật trạng thái: ${newStatus}`)
      fetchOrders()
    } catch (err) {
      console.error(err)
      message.error(err.message || 'Không thể cập nhật trạng thái')
    }
  }

  const handleCancelOrder = async (id) => {
    try {
      await cancelOrder(id)
      message.success('Đã hủy đơn hàng')
      fetchOrders()
    } catch (err) {
      console.error(err)
      message.error(err.message || 'Không thể hủy đơn hàng')
    }
  }

  const handleDeleteOrder = async (id) => {
    try {
      await deleteOrder(id)
      message.success('Đã xóa đơn hàng')
      fetchOrders()
    } catch (err) {
      console.error(err)
      message.error(err.message || 'Không thể xóa đơn hàng')
    }
  }

  const renderStatus = (status) => {
    let color = 'default'
    if (['served', 'picked_up', 'paid'].includes(status)) color = 'green'
    else if (['cooking', 'ready'].includes(status)) color = 'orange'
    else if (status === 'pending') color = 'blue'
    else if (status === 'cancelled') color = 'red'
    return <Tag color={color}>{status.toUpperCase()}</Tag>
  }

  const renderPaidStatus = (paidStatus, orderStatus, record) => {
    const paid = paidStatus === 'paid' || orderStatus === 'paid'
    const canMarkPaid =
      record?.order_type === 'takeaway' &&
      record?.payment_method !== 'online' &&
      !paid &&
      orderStatus === 'picked_up'

    return (
      <Space size="small">
        <Tag color={paid ? 'green' : 'default'}>{paid ? 'ĐÃ TRẢ' : 'CHƯA TRẢ'}</Tag>
        {canMarkPaid && (
          <Button size="small" type="primary" onClick={() => handleStatusChange(record._id, 'paid')}>
            Đánh dấu đã trả
          </Button>
        )}
      </Space>
    )
  }

  const dineInColumns = [
    { title: 'ORDER ID', dataIndex: '_id', key: 'id', render: (id) => <span className="font-mono text-[11px] text-zinc-700">{id}</span> },
    { title: 'THỜI GIAN TẠO', dataIndex: 'createdAt', key: 'createdAt', render: (value) => <span className="text-xs text-zinc-600">{formatDateTime(value)}</span> },
    { title: 'BÀN', dataIndex: 'table', key: 'table', render: (table) => <Tag>{table?.name || 'Không rõ'}</Tag> },
    { 
      title: 'ITEMS', 
      dataIndex: 'items', 
      key: 'items',
      render: (items) => (
        <span className="text-xs">
          {items?.map(i => `${i.menu_item?.name} x${i.quantity}`).join(', ')}
        </span>
      )
    },
    { title: 'AMOUNT', dataIndex: 'total_amount', key: 'amount', render: (val) => formatPrice(val) },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: renderStatus },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => {
        const { status } = record
        const canCancel = !['cancelled', 'paid', 'picked_up'].includes(status)
        const canDelete = status === 'cancelled'

        return (
          <Space size="small">
            {status === 'pending' && <Button size="small" onClick={() => handleStatusChange(record._id, 'cooking')}>Nấu</Button>}
            {status === 'cooking' && <Button size="small" onClick={() => handleStatusChange(record._id, 'served')}>Phục vụ</Button>}
            {status === 'served' && <Button size="small" type="primary" onClick={() => handleStatusChange(record._id, 'paid')}>Thanh toán</Button>}
            {canCancel && (
              <Popconfirm title="Bạn có chắc muốn hủy đơn này?" onConfirm={() => handleCancelOrder(record._id)}>
                <Button size="small" danger>Hủy đơn</Button>
              </Popconfirm>
            )}
            {canDelete && (
              <Popconfirm title="Bạn có chắc muốn xóa vĩnh viễn?" onConfirm={() => handleDeleteOrder(record._id)}>
                <Button size="small" type="default">Xóa</Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  const takeawayColumns = [
    { title: 'ORDER ID', dataIndex: '_id', key: 'id', render: (id) => <span className="font-mono text-[11px] text-zinc-700">{id}</span> },
    { title: 'THỜI GIAN TẠO', dataIndex: 'createdAt', key: 'createdAt', render: (value) => <span className="text-xs text-zinc-600">{formatDateTime(value)}</span> },
    { 
      title: 'CUSTOMER', 
      key: 'customer', 
      render: (_, row) => (
        <div>
          <div className="font-medium text-xs">{row.customer_name || 'Khách lẻ'}</div>
          <div className="text-[10px] text-zinc-500">{row.customer_phone || ''}</div>
        </div>
      )
    },
    { 
        title: 'ITEMS', 
        dataIndex: 'items', 
        key: 'items',
        render: (items) => (
          <span className="text-xs">
            {items?.map(i => `${i.menu_item?.name} x${i.quantity}`).join(', ')}
          </span>
        )
    },
    { title: 'AMOUNT', dataIndex: 'total_amount', key: 'amount', render: (val) => formatPrice(val) },
    { title: 'PAID STATUS', dataIndex: 'paid_status', key: 'paid_status', render: (value, record) => renderPaidStatus(value, record.status, record) },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render: renderStatus },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => {
        const { status } = record
        const canCancel = !['cancelled', 'paid', 'picked_up'].includes(status)
        const canDelete = status === 'cancelled'

        return (
          <Space size="small">
            {status === 'pending' && <Button size="small" onClick={() => handleStatusChange(record._id, 'cooking')}>Nấu</Button>}
            {status === 'cooking' && <Button size="small" onClick={() => handleStatusChange(record._id, 'ready')}>Sẵn sàng</Button>}
            {status === 'ready' && <Button size="small" onClick={() => handleStatusChange(record._id, 'picked_up')}>Đã lấy</Button>}
            {canCancel && (
              <Popconfirm title="Bạn có chắc muốn hủy đơn này?" onConfirm={() => handleCancelOrder(record._id)}>
                <Button size="small" danger>Hủy đơn</Button>
              </Popconfirm>
            )}
            {canDelete && (
              <Popconfirm title="Bạn có chắc muốn xóa vĩnh viễn?" onConfirm={() => handleDeleteOrder(record._id)}>
                <Button size="small" type="default">Xóa</Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  const statItems = [
    { key: 't_orders', label: 'ĐƠN HÔM NAY', value: stats?.today_orders || 0, note: 'Từ lúc mở cửa' },
    { key: 't_rev', label: 'DOANH THU', value: formatPrice(stats?.today_revenue), note: 'Chỉ tính đơn đã thanh toán' },
    { key: 'act_orders', label: 'ĐANG XỬ LÝ', value: (stats?.by_status?.pending || 0) + (stats?.by_status?.cooking || 0), note: 'Khối lượng bếp' },
  ]

  const filteredDineInOrders = useMemo(() => {
    const keyword = String(adminSearchQuery || '').trim().toLowerCase()
    if (!keyword) return dineInOrders
    return dineInOrders.filter((order) => String(order?._id || '').toLowerCase().includes(keyword))
  }, [adminSearchQuery, dineInOrders])

  const filteredTakeawayOrders = useMemo(() => {
    const keyword = String(adminSearchQuery || '').trim().toLowerCase()
    if (!keyword) return takeawayOrders
    return takeawayOrders.filter((order) => String(order?._id || '').toLowerCase().includes(keyword))
  }, [adminSearchQuery, takeawayOrders])

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        title="Quản lý đơn hàng"
        subtitle="Theo dõi trạng thái bếp và vận hành ăn tại chỗ/giao hàng theo thời gian thực"
      />

      <Row gutter={[16, 16]}>
        {statItems.map((stat, idx) => (
          <Col key={stat.key} xs={24} md={8}>
            <AdminStatCard title={stat.label} value={stat.value} note={stat.note} accent={idx === 1} />
          </Col>
        ))}
      </Row>

      <Card className="admin-panel-card mt-6" bodyStyle={{ padding: 0 }}>
         <Tabs 
           defaultActiveKey="1"
           className="brand-tabs px-5 pt-3"
           items={[
             {
               key: '1',
               label: <span className="font-semibold px-2">ĐƠN ĂN TẠI CHỖ</span>,
               children: <AdminDataTable rowKey="_id" loading={loading} columns={dineInColumns} dataSource={filteredDineInOrders} />
             },
             {
               key: '2',
               label: <span className="font-semibold px-2">ĐƠN MANG ĐI / GIAO HÀNG</span>,
               children: <AdminDataTable rowKey="_id" loading={loading} columns={takeawayColumns} dataSource={filteredTakeawayOrders} />
             }
           ]}
         />
      </Card>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card className="admin-panel-card admin-warning-card h-full">
            <div className="admin-warning-card__quote">"Precision is the ingredient of perfection."</div>
            <p>Hãy xác minh đầy đủ thông tin trước khi giao đơn mang đi cho khách.</p>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-panel-card h-full" title="Tạo đơn thủ công">
            <p>Nhấn bên dưới để tạo nhanh đơn đặt qua điện thoại hoặc khách lẻ.</p>
            <button type="button" className="admin-neutral-btn">Tạo nhanh</button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
