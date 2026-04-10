import { Table } from 'antd'

export default function AdminDataTable({ columns, dataSource, pagination = false }) {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      className="admin-data-table"
      scroll={{ x: 780 }}
      rowClassName={() => 'admin-data-table__row'}
    />
  )
}
