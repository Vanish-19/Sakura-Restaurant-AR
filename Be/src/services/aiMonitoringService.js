import AiMonitoringLog from '../models/AiMonitoringLog.js';

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
const TOP_GROUP_LIMIT = 10;
const RECENT_REQUEST_LIMIT = 20;
const DAILY_TREND_DAYS = 7;

const MODEL_PRICING_USD_PER_MILLION = {
  'gpt-4o-mini': {
    input: 0.15,
    output: 0.6,
  },
};

function normalizeText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function clipText(value = '', maxLength = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
}

function getQuestionGroup(intent = 'general', message = '') {
  const normalized = normalizeText(message);

  if (intent === 'table_availability') {
    return normalized.match(/\d+\s*(nguoi|khach)/) ? 'Bàn trống theo sức chứa' : 'Kiểm tra bàn trống';
  }

  if (intent === 'menu_recommendation') {
    if (/(duoi|max|toi da|khong qua|\d+\s*(k|nghin|tr|trieu))/.test(normalized)) {
      return 'Tư vấn món theo ngân sách';
    }
    if (/(di ung|khong an|tranh|nguyen lieu)/.test(normalized)) {
      return 'Tư vấn món theo dị ứng hoặc nguyên liệu';
    }
    if (/(ban chay|best seller|ar|3d|quick look|scene viewer)/.test(normalized)) {
      return 'Tư vấn món nổi bật và AR';
    }
    return 'Tư vấn món ăn';
  }

  if (intent === 'ar_support') return 'Hỗ trợ AR hoặc VR';
  if (intent === 'payment_support') return 'Thanh toán và hoàn tiền';
  if (intent === 'booking_support') return 'Đặt bàn và giữ chỗ';
  if (intent === 'contact_info') return 'Thông tin liên hệ và giờ mở cửa';
  if (intent === 'order_support') return 'Đặt món và lịch sử đơn';
  if (intent === 'content_discovery') return 'Blog, tin tức và khuyến mãi';

  if (intent === 'site_info') {
    if (/(privacy|bao mat|du lieu|quyen rieng tu|camera|vr|webxr|thu thap)/.test(normalized)) {
      return 'Chính sách dữ liệu và bảo mật';
    }
    if (/(tuyen dung|career|ung tuyen|viec lam)/.test(normalized)) {
      return 'Tuyển dụng và cơ hội nghề nghiệp';
    }
    if (/(press|bao chi|truyen thong|press kit)/.test(normalized)) {
      return 'Press kit và truyền thông';
    }
    if (/(gioi thieu|about|tam nhin|su menh)/.test(normalized)) {
      return 'Giới thiệu thương hiệu';
    }
    return 'Thông tin website và trang public';
  }

  if (/(menu|mon|sushi|ramen|tempura)/.test(normalized)) return 'Tư vấn món ăn';
  if (/(blog|bai viet|khuyen mai|tin tuc)/.test(normalized)) return 'Blog, tin tức và khuyến mãi';
  if (/(ban trong|con ban|dat ban)/.test(normalized)) return 'Kiểm tra bàn trống';
  return 'Hỗ trợ chung về nhà hàng';
}

export function estimateUsageCost({ model = 'gpt-4o-mini', promptTokens = 0, completionTokens = 0 }) {
  const pricing = MODEL_PRICING_USD_PER_MILLION[model];
  if (!pricing) return 0;

  const inputCost = (Number(promptTokens || 0) / 1_000_000) * pricing.input;
  const outputCost = (Number(completionTokens || 0) / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(8));
}

export async function recordAiMonitoringEvent({
  conversationId = '',
  requestId = '',
  provider = 'openai',
  model = 'gpt-4o-mini',
  intent = 'general',
  message = '',
  currentPath = '',
  selectedTools = [],
  failedToolNames = [],
  llmRequestCount = 0,
  toolCallCount = 0,
  promptTokens = 0,
  completionTokens = 0,
  totalTokens = 0,
  estimatedCostUsd = null,
  latencyMs = 0,
  usedFallback = false,
  status = 'success',
  replyPreview = '',
}) {
  const normalizedPromptTokens = Number(promptTokens || 0);
  const normalizedCompletionTokens = Number(completionTokens || 0);
  const normalizedTotalTokens =
    Number(totalTokens || 0) || normalizedPromptTokens + normalizedCompletionTokens;

  await AiMonitoringLog.create({
    conversationId,
    requestId,
    provider,
    model,
    intent,
    questionGroup: getQuestionGroup(intent, message),
    userMessage: clipText(message, 420),
    currentPath,
    selectedTools,
    failedToolNames,
    llmRequestCount: Number(llmRequestCount || 0),
    toolCallCount: Number(toolCallCount || 0),
    promptTokens: normalizedPromptTokens,
    completionTokens: normalizedCompletionTokens,
    totalTokens: normalizedTotalTokens,
    estimatedCostUsd:
      estimatedCostUsd == null
        ? estimateUsageCost({
            model,
            promptTokens: normalizedPromptTokens,
            completionTokens: normalizedCompletionTokens,
          })
        : Number(estimatedCostUsd || 0),
    latencyMs: Number(latencyMs || 0),
    usedFallback: Boolean(usedFallback),
    status,
    replyPreview: clipText(replyPreview, 220),
  });
}

function buildDateRangeMatch(days = 30) {
  const safeDays = Number(days);
  if (!Number.isFinite(safeDays) || safeDays <= 0) return {};

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (safeDays - 1));

  return {
    createdAt: { $gte: start },
  };
}

function buildLastNDaysLabels(days = DAILY_TREND_DAYS) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return {
      key: `${yyyy}-${mm}-${dd}`,
      label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    };
  });
}

export async function getAiMonitoringOverview({ days = 30 } = {}) {
  const safeDays = Math.min(Math.max(Number(days) || 30, 1), 180);
  const match = buildDateRangeMatch(safeDays);

  const [
    summaryRaw,
    topQuestionGroups,
    topToolsRaw,
    recentRequests,
    dailyTrendRaw,
    intentBreakdown,
    modelBreakdown,
    statusBreakdown,
  ] = await Promise.all([
    AiMonitoringLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalPromptTokens: { $sum: '$promptTokens' },
          totalCompletionTokens: { $sum: '$completionTokens' },
          totalTokens: { $sum: '$totalTokens' },
          totalCostUsd: { $sum: '$estimatedCostUsd' },
          avgLatencyMs: { $avg: '$latencyMs' },
          fallbackCount: {
            $sum: {
              $cond: ['$usedFallback', 1, 0],
            },
          },
          totalToolCalls: { $sum: '$toolCallCount' },
          totalLlmRequests: { $sum: '$llmRequestCount' },
          uniqueConversations: { $addToSet: '$conversationId' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRequests: 1,
          totalPromptTokens: 1,
          totalCompletionTokens: 1,
          totalTokens: 1,
          totalCostUsd: 1,
          avgLatencyMs: { $round: ['$avgLatencyMs', 2] },
          fallbackCount: 1,
          totalToolCalls: 1,
          totalLlmRequests: 1,
          uniqueConversationCount: { $size: '$uniqueConversations' },
        },
      },
    ]),
    AiMonitoringLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$questionGroup',
          requests: { $sum: 1 },
          promptTokens: { $sum: '$promptTokens' },
          completionTokens: { $sum: '$completionTokens' },
          totalCostUsd: { $sum: '$estimatedCostUsd' },
        },
      },
      { $sort: { requests: -1, totalCostUsd: -1 } },
      { $limit: TOP_GROUP_LIMIT },
      {
        $project: {
          _id: 0,
          group: '$_id',
          requests: 1,
          promptTokens: 1,
          completionTokens: 1,
          totalCostUsd: { $round: ['$totalCostUsd', 6] },
        },
      },
    ]),
    AiMonitoringLog.aggregate([
      { $match: match },
      { $unwind: '$selectedTools' },
      {
        $group: {
          _id: '$selectedTools',
          requests: { $sum: 1 },
        },
      },
      { $sort: { requests: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          tool: '$_id',
          requests: 1,
        },
      },
    ]),
    AiMonitoringLog.find(match)
      .sort({ createdAt: -1 })
      .limit(RECENT_REQUEST_LIMIT)
      .lean(),
    AiMonitoringLog.aggregate([
      { $match: { ...buildDateRangeMatch(DAILY_TREND_DAYS) } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: DEFAULT_TIMEZONE,
            },
          },
          requests: { $sum: 1 },
          promptTokens: { $sum: '$promptTokens' },
          completionTokens: { $sum: '$completionTokens' },
          totalCostUsd: { $sum: '$estimatedCostUsd' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AiMonitoringLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$intent',
          requests: { $sum: 1 },
        },
      },
      { $sort: { requests: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, intent: '$_id', requests: 1 } },
    ]),
    AiMonitoringLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$model',
          requests: { $sum: 1 },
          totalCostUsd: { $sum: '$estimatedCostUsd' },
        },
      },
      { $sort: { requests: -1 } },
      { $project: { _id: 0, model: '$_id', requests: 1, totalCostUsd: { $round: ['$totalCostUsd', 6] } } },
    ]),
    AiMonitoringLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          requests: { $sum: 1 },
        },
      },
      { $sort: { requests: -1 } },
      { $project: { _id: 0, status: '$_id', requests: 1 } },
    ]),
  ]);

  const summary = summaryRaw[0] || {
    totalRequests: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    avgLatencyMs: 0,
    fallbackCount: 0,
    totalToolCalls: 0,
    totalLlmRequests: 0,
    uniqueConversationCount: 0,
  };

  const dailyLabels = buildLastNDaysLabels(DAILY_TREND_DAYS);
  const dailyMap = new Map((dailyTrendRaw || []).map((entry) => [entry._id, entry]));
  const dailyTrend = dailyLabels.map((item) => {
    const raw = dailyMap.get(item.key);
    return {
      date: item.key,
      label: item.label,
      requests: Number(raw?.requests || 0),
      promptTokens: Number(raw?.promptTokens || 0),
      completionTokens: Number(raw?.completionTokens || 0),
      totalCostUsd: Number(Number(raw?.totalCostUsd || 0).toFixed(6)),
    };
  });

  return {
    windowDays: safeDays,
    summary: {
      ...summary,
      totalCostUsd: Number(Number(summary.totalCostUsd || 0).toFixed(6)),
      avgCostPerRequestUsd:
        summary.totalRequests > 0
          ? Number((Number(summary.totalCostUsd || 0) / Number(summary.totalRequests || 1)).toFixed(6))
          : 0,
      fallbackRate:
        summary.totalRequests > 0
          ? Number(((Number(summary.fallbackCount || 0) / Number(summary.totalRequests || 1)) * 100).toFixed(2))
          : 0,
    },
    topQuestionGroups,
    topTools: topToolsRaw,
    intentBreakdown,
    modelBreakdown,
    statusBreakdown,
    dailyTrend,
    recentRequests: recentRequests.map((entry) => ({
      id: entry._id,
      createdAt: entry.createdAt,
      intent: entry.intent,
      questionGroup: entry.questionGroup,
      model: entry.model,
      promptTokens: entry.promptTokens,
      completionTokens: entry.completionTokens,
      totalTokens: entry.totalTokens,
      estimatedCostUsd: Number(Number(entry.estimatedCostUsd || 0).toFixed(6)),
      latencyMs: entry.latencyMs,
      usedFallback: Boolean(entry.usedFallback),
      status: entry.status,
      selectedTools: entry.selectedTools || [],
      userMessage: clipText(entry.userMessage, 160),
      currentPath: entry.currentPath || '',
    })),
  };
}
