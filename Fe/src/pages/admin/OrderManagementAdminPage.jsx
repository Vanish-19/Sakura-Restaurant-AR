import { Card, Col, Row, Tag, message, Button, Space, Tabs } from 'antd'
import { useEffect, useState } from 'react'
import AdminDataTable from '../../components/molecules/admin/AdminDataTable.jsx'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { getAllOrders, getOrderStats, updateOrderStatus } from '../../services/adminOrderApi.js'

function formatPrice(num) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(num || 0))
}

export default function OrderManagementAdminPage() {
  const [dineInOrders, setDineInOrders] = useState([])
  const [takeawayOrders, setTakeawayOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const resDineIn = await getAllOrders({ order_type: 'dine_in' })
      const resTakeaway = await getAllOrders({ order_type: 'takeaway' })
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
      message.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus)
      message.success(`Status updated to ${newStatus}`)
      fetchOrders()
    } catch (err) {
      console.error(err)
      message.error(err.message || 'Failed to update status')
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
            Mark Paid
          </Button>
        )}
      </Space>
    )
  }

  const dineInColumns = [
    { title: 'ORDER ID', dataIndex: '_id', key: 'id', render: (id) => <span className="text-xs text-zinc-500">...{id.slice(-6)}</span> },
    { title: 'TABLE', dataIndex: 'table', key: 'table', render: (table) => <Tag>{table?.name || 'Unknown'}</Tag> },
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
        return (
          <Space size="small">
            {status === 'pending' && <Button size="small" onClick={() => handleStatusChange(record._id, 'cooking')}>Cook</Button>}
            {status === 'cooking' && <Button size="small" onClick={() => handleStatusChange(record._id, 'served')}>Serve</Button>}
            {status === 'served' && <Button size="small" type="primary" onClick={() => handleStatusChange(record._id, 'paid')}>Pay</Button>}
          </Space>
        )
      },
    },
  ]

  const takeawayColumns = [
    { title: 'ORDER ID', dataIndex: '_id', key: 'id', render: (id) => <span className="text-xs text-zinc-500">...{id.slice(-6)}</span> },
    { 
      title: 'CUSTOMER', 
      key: 'customer', 
      render: (_, row) => (
        <div>
          <div className="font-medium text-xs">{row.customer_name || 'Walk-in'}</div>
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
        return (
          <Space size="small">
            {status === 'pending' && <Button size="small" onClick={() => handleStatusChange(record._id, 'cooking')}>Cook</Button>}
            {status === 'cooking' && <Button size="small" onClick={() => handleStatusChange(record._id, 'ready')}>Ready</Button>}
            {status === 'ready' && <Button size="small" onClick={() => handleStatusChange(record._id, 'picked_up')}>Pickup</Button>}
          </Space>
        )
      },
    },
  ]

  const statItems = [
    { key: 't_orders', label: 'TODAY ORDERS', value: stats?.today_orders || 0, note: 'Since opening' },
    { key: 't_rev', label: 'REVENUE', value: formatPrice(stats?.today_revenue), note: 'Only paid orders' },
    { key: 'act_orders', label: 'IN PROGRESS', value: (stats?.by_status?.pending || 0) + (stats?.by_status?.cooking || 0), note: 'Kitchen workload' },
  ]

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        title="Order Management"
        subtitle="Real-time control over kitchen pulse and dine-in/takeaway floor logistics"
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
           className="px-5 pt-3"
           items={[
             {
               key: '1',
               label: <span className="font-semibold px-2">DINE-IN ORDERS</span>,
               children: <AdminDataTable rowKey="_id" loading={loading} columns={dineInColumns} dataSource={dineInOrders} />
             },
             {
               key: '2',
               label: <span className="font-semibold px-2">TAKEAWAY / DELIVERY</span>,
               children: <AdminDataTable rowKey="_id" loading={loading} columns={takeawayColumns} dataSource={takeawayOrders} />
             }
           ]}
         />
      </Card>
      
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} lg={16}>
          <Card className="admin-panel-card admin-warning-card h-full">
            <div className="admin-warning-card__quote">"Precision is the ingredient of perfection."</div>
            <p>Ensure that all takeaway pickups are verified before handing over the bags.</p>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="admin-panel-card h-full" title="New Manual Order">
            <p>Click below to create quick order for phone bookings or walk-ins.</p>
            <button type="button" className="admin-neutral-btn">Quick Create</button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
