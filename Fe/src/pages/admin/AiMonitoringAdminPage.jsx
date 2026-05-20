import {
  AlertOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FireOutlined,
  LoadingOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Select, Spin, Table, Tag, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import AdminSectionHeader from '../../components/molecules/admin/AdminSectionHeader.jsx'
import AdminStatCard from '../../components/molecules/admin/AdminStatCard.jsx'
import { getAiMonitoringOverview } from '../../services/adminAiMonitoringApi.js'

function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0))
}

function formatUsd(value) {
  return `$${Number(value || 0).toFixed(6)}`
}

function statusTone(status) {
  if (status === 'success') return 'green'
  if (status === 'fallback') return 'gold'
  return 'red'
}

const dayOptions = [
  { label: '7 ngày', value: 7 },
  { label: '30 ngày', value: 30 },
  { label: '90 ngày', value: 90 },
]

export default function AiMonitoringAdminPage() {
  const [windowDays, setWindowDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async (days = windowDays) => {
    try {
      setLoading(true)
      const res = await getAiMonitoringOverview(days)
      if (res?.success) {
        setData(res.data)
      }
    } catch (error) {
      console.error(error)
      message.error('Không thể tải dữ liệu monitoring của AI')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(windowDays)
  }, [windowDays])

  const summary = data?.summary || {}
  const topQuestionGroups = data?.topQuestionGroups || []
  const topTools = data?.topTools || []
  const dailyTrend = data?.dailyTrend || []
  const recentRequests = data?.recentRequests || []
  const modelBreakdown = data?.modelBreakdown || []
  const statusBreakdown = data?.statusBreakdown || []
  const intentBreakdown = data?.intentBreakdown || []

  const maxDailyRequests = useMemo(
    () => Math.max(1, ...dailyTrend.map((entry) => Number(entry.requests || 0))),
    [dailyTrend],
  )

  const statItems = [
    { key: 'requests', title: 'LƯỢT REQUEST', value: formatNumber(summary.totalRequests), note: `${formatNumber(summary.uniqueConversationCount)} hội thoại` },
    { key: 'input', title: 'INPUT TOKENS', value: formatNumber(summary.totalPromptTokens), note: `${formatNumber(summary.totalLlmRequests)} lần gọi LLM` },
    { key: 'output', title: 'OUTPUT TOKENS', value: formatNumber(summary.totalCompletionTokens), note: `${formatNumber(summary.totalTokens)} tổng token` },
    { key: 'cost', title: 'TỔNG COST', value: formatUsd(summary.totalCostUsd), note: `${formatUsd(summary.avgCostPerRequestUsd)} / request` },
    { key: 'latency', title: 'LATENCY TB', value: `${Number(summary.avgLatencyMs || 0).toFixed(2)} ms`, note: `${Number(summary.fallbackRate || 0).toFixed(2)}% fallback` },
  ]

  const recentColumns = [
    {
      title: 'THỜI GIAN',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => (
        <span className="text-xs text-zinc-500">
          {value ? new Date(value).toLocaleString('vi-VN') : '--'}
        </span>
      ),
    },
    {
      title: 'NHÓM CÂU HỎI',
      dataIndex: 'questionGroup',
      key: 'questionGroup',
      render: (value, row) => (
        <div>
          <div className="font-semibold text-zinc-900">{value}</div>
          <div className="text-[11px] text-zinc-500">{row.intent}</div>
        </div>
      ),
    },
    {
      title: 'MESSAGE',
      dataIndex: 'userMessage',
      key: 'userMessage',
      render: (value, row) => (
        <div>
          <div className="text-sm text-zinc-800">{value}</div>
          <div className="text-[11px] text-zinc-500">{row.currentPath || 'Không rõ trang'}</div>
        </div>
      ),
    },
    {
      title: 'TOOLS',
      dataIndex: 'selectedTools',
      key: 'selectedTools',
      render: (tools) => (
        <div className="flex flex-wrap gap-1">
          {(tools?.length ? tools : ['none']).map((tool) => (
            <Tag key={tool} className="!m-0">
              {tool}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'TOKENS',
      key: 'tokens',
      render: (_, row) => (
        <div className="text-xs text-zinc-700">
          <div>In: {formatNumber(row.promptTokens)}</div>
          <div>Out: {formatNumber(row.completionTokens)}</div>
        </div>
      ),
    },
    {
      title: 'COST',
      dataIndex: 'estimatedCostUsd',
      key: 'estimatedCostUsd',
      render: (value) => <span className="font-semibold text-zinc-800">{formatUsd(value)}</span>,
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      render: (_, row) => (
        <div className="space-y-1">
          <Tag color={statusTone(row.status)}>{row.status}</Tag>
          {row.usedFallback ? <div className="text-[11px] text-amber-600">fallback</div> : null}
        </div>
      ),
    },
  ]

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    )
  }

  return (
    <div className="admin-page pb-20">
      <AdminSectionHeader
        eyebrow="AI Observatory"
        title="Monitoring chatbot AI"
        subtitle="Theo dõi token, cost, chất lượng phục hồi fallback, nhóm câu hỏi phổ biến và mức độ sử dụng tool của trợ lý AI."
        action={
          <Select
            value={windowDays}
            onChange={setWindowDays}
            options={dayOptions}
            style={{ width: 140 }}
          />
        }
      />

      <Row gutter={[16, 16]}>
        {statItems.map((stat, index) => (
          <Col key={stat.key} xs={24} sm={12} xl={24 / 5}>
            <AdminStatCard title={stat.title} value={stat.value} note={stat.note} accent={index === 3} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card className="admin-panel-card h-full">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="m-0 text-[24px] font-semibold text-zinc-900">Xu hướng 7 ngày gần nhất</h3>
                <p className="mt-1 mb-0 text-sm text-zinc-500">Requests, token và chi phí AI theo ngày.</p>
              </div>
              <BarChartOutlined className="text-xl text-zinc-400" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="h-[260px] rounded-xl border border-[#ececef] bg-[#fafafb] px-4 py-5">
                <div className="flex h-full items-end gap-3">
                  {dailyTrend.map((entry) => {
                    const ratio = Number(entry.requests || 0) / maxDailyRequests
                    const height = `${Math.max(8, Math.round(ratio * 100))}%`

                    return (
                      <div key={entry.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-[10px] font-medium text-[#7a7d84]">{formatNumber(entry.requests)}</span>
                        <div className="relative flex h-[170px] w-full items-end rounded-md bg-white/70 px-1.5 pb-1.5 ring-1 ring-[#ededf0]">
                          <div
                            className="w-full rounded-sm bg-gradient-to-t from-[#b60d1d] to-[#e33a4f] shadow-[0_8px_14px_rgba(179,18,40,0.25)]"
                            style={{ height }}
                            title={`${entry.label}: ${entry.requests} requests`}
                          />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-[#8a8d95]">{entry.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {dailyTrend.map((entry) => (
                  <div key={entry.date} className="rounded-xl border border-zinc-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-zinc-900">{entry.label}</div>
                      <Tag className="!m-0">{entry.requests} req</Tag>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      Input: {formatNumber(entry.promptTokens)} • Output: {formatNumber(entry.completionTokens)}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-[#8B0000]">{formatUsd(entry.totalCostUsd)}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card className="admin-panel-card h-full">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="m-0 text-[24px] font-semibold text-zinc-900">Tình trạng hệ thống AI</h3>
                <p className="mt-1 mb-0 text-sm text-zinc-500">Một số chỉ báo bổ sung để kiểm soát trải nghiệm và chi phí.</p>
              </div>
              <RobotOutlined className="text-xl text-zinc-400" />
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <ThunderboltOutlined className="text-lg text-[#8B0000]" />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Tool calls</div>
                    <div className="text-lg font-semibold text-zinc-900">{formatNumber(summary.totalToolCalls)} lần</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <ClockCircleOutlined className="text-lg text-[#8B0000]" />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Latency trung bình</div>
                    <div className="text-lg font-semibold text-zinc-900">{Number(summary.avgLatencyMs || 0).toFixed(2)} ms</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <AlertOutlined className="text-lg text-[#8B0000]" />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Fallback rate</div>
                    <div className="text-lg font-semibold text-zinc-900">{Number(summary.fallbackRate || 0).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <DollarOutlined className="text-lg text-[#8B0000]" />
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Cost / request</div>
                    <div className="text-lg font-semibold text-zinc-900">{formatUsd(summary.avgCostPerRequestUsd)}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="admin-panel-card h-full">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="m-0 text-[24px] font-semibold text-zinc-900">Top 10 nhóm câu hỏi</h3>
                <p className="mt-1 mb-0 text-sm text-zinc-500">Những cụm nhu cầu người dùng hỏi nhiều nhất trong cửa sổ đang chọn.</p>
              </div>
              <FireOutlined className="text-xl text-zinc-400" />
            </div>

            <div className="space-y-3">
              {topQuestionGroups.length === 0 ? (
                <p className="text-sm text-zinc-500">Chưa có dữ liệu đủ để thống kê nhóm câu hỏi.</p>
              ) : (
                topQuestionGroups.map((entry, index) => (
                  <div key={entry.group} className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">#{index + 1}</div>
                        <div className="mt-1 text-base font-semibold text-zinc-900">{entry.group}</div>
                      </div>
                      <Tag className="!m-0 !rounded-full !border-rose-200 !bg-rose-50 !text-rose-700">{entry.requests} lượt</Tag>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      Input: {formatNumber(entry.promptTokens)} • Output: {formatNumber(entry.completionTokens)} • Cost: {formatUsd(entry.totalCostUsd)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="admin-panel-card h-full">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="m-0 text-[24px] font-semibold text-zinc-900">Breakdown mô hình, intent và tool</h3>
                <p className="mt-1 mb-0 text-sm text-zinc-500">Những chỉ báo bổ sung để xem LLM đang được dùng ra sao.</p>
              </div>
              <RobotOutlined className="text-xl text-zinc-400" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Model</div>
                <div className="mt-3 space-y-2">
                  {modelBreakdown.map((entry) => (
                    <div key={entry.model} className="text-sm text-zinc-800">
                      <div className="font-semibold">{entry.model}</div>
                      <div className="text-xs text-zinc-500">{entry.requests} req • {formatUsd(entry.totalCostUsd)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Intent</div>
                <div className="mt-3 space-y-2">
                  {intentBreakdown.map((entry) => (
                    <div key={entry.intent} className="text-sm text-zinc-800">
                      <div className="font-semibold">{entry.intent}</div>
                      <div className="text-xs text-zinc-500">{entry.requests} req</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-[11px] uppercase tracking-[0.14em] text-zinc-400">Tools / Status</div>
                <div className="mt-3 space-y-2">
                  {topTools.map((entry) => (
                    <div key={entry.tool} className="text-sm text-zinc-800">
                      <div className="font-semibold">{entry.tool}</div>
                      <div className="text-xs text-zinc-500">{entry.requests} req</div>
                    </div>
                  ))}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {statusBreakdown.map((entry) => (
                      <Tag key={entry.status} color={statusTone(entry.status)}>
                        {entry.status}: {entry.requests}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="admin-panel-card">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="m-0 text-[24px] font-semibold text-zinc-900">Recent AI requests</h3>
            <p className="mt-1 mb-0 text-sm text-zinc-500">Nhìn nhanh từng request gần đây để debug nhóm câu hỏi, tool và cost trên từng lượt.</p>
          </div>
        </div>

        <Table
          columns={recentColumns}
          dataSource={recentRequests}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1080 }}
        />
      </Card>
    </div>
  )
}
