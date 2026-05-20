import { Table } from 'antd'

export default function AdminDataTable({
  columns,
  dataSource,
  pagination = false,
  rowKey = '_id',
  loading = false,
  ...rest
}) {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      rowKey={rowKey}
      loading={loading}
      className="admin-data-table"
      scroll={{ x: 780 }}
      rowClassName={() => 'admin-data-table__row'}
      {...rest}
    />
  )
}
