import crypto from 'node:crypto';
import Article from '../models/Article.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import { CHAT_KNOWLEDGE_BASE } from '../config/chatKnowledge.js';
import { chatWithAI, mergeUsageTotals, planAIToolCalls } from './aiService.js';
import { estimateUsageCost, recordAiMonitoringEvent } from './aiMonitoringService.js';
import { createReservation } from './tableReservationService.js';
import { getStaticPages, STATIC_PAGE_DEFAULTS } from './staticPageContentService.js';
import {
  appendConversationMessage,
  ensureConversation,
  getConversationHistory,
  getConversationMetadata,
  getConversationSummary,
  updateConversationSummary,
  updateConversationMetadata,
} from './chatSessionStore.js';

const MENU_ITEM_FIELDS = [
  'name',
  'category',
  'price',
  'description',
  'image_url',
  'ar_models',
  'is_best_seller',
  'is_available',
  'ingredients',
  'allergens',
  'recommended_for',
].join(' ');

const MAX_HISTORY_MESSAGES = 4;
const MAX_TOOL_CONTEXT_LENGTH = 900;
const MAX_SUMMARY_ENTRIES = 4;
const MAX_TABLE_RESULT_ITEMS = 6;
const MAX_SITE_RESULT_ITEMS = 6;

const MENU_DISCOVERY_KEYWORDS = [
  'mon',
  'menu',
  'sushi',
  'ramen',
  'tempura',
  'an gi',
  'goi y',
  'best seller',
  'ban chay',
  'gia',
  'di ung',
  'nguyen lieu',
];

const CONTENT_DISCOVERY_KEYWORDS = ['blog', 'bai viet', 'khuyen mai', 'tin tuc', 'uu dai', 'promotion'];

const SITE_CONTENT_KEYWORDS = [
  'website',
  'web',
  'trang web',
  'trang nao',
  'gioi thieu',
  'about',
  'career',
  'ung tuyen',
  'tuyen dung',
  'cv',
  'portfolio',
  'press kit',
  'press',
  'bao chi',
  'truyen thong',
  'thuong hieu',
  'tam nhin',
  'su menh',
  'privacy',
  'chinh sach',
  'bao mat',
  'terms',
  'dieu khoan',
  'du lieu',
  'quyen rieng tu',
  'camera',
  'vr',
  'webxr',
  'thu thap',
];

const TABLE_AVAILABILITY_KEYWORDS = [
  'ban trong',
  'con ban',
  'con cho',
  'ban nao trong',
  'table available',
  'available table',
  'trong khong',
  'suc chua ban',
  'capacity',
  'ban 2 nguoi',
  'ban 4 nguoi',
  'ban 6 nguoi',
  'ban 8 nguoi',
];

const SUPPORT_KEYWORDS = [
  'gio mo cua',
  'gio dong cua',
  'mo cua',
  'dong cua',
  'dia chi',
  'hotline',
  'lien he',
  'email',
  'so dien thoai',
  'phone',
  'dat ban',
  'reservation',
  'book ban',
  'thanh toan',
  'sepay',
  'cod',
  'hoan tien',
  'payment',
  'giao hang',
  'mang ve',
  'takeaway',
  'delivery',
  'order',
  'quick look',
  'scene viewer',
  'webxr',
  'ar',
  '3d',
  'qr',
  'quet',
  'quét',
  'ban trong',
  'con ban',
  'con cho',
  'website',
  'web',
  'gioi thieu',
  'about',
  'career',
  'press kit',
  'privacy',
  'dieu khoan',
];

const TOOL_LABELS = {
  restaurant_info: 'Thông tin nhà hàng',
  menu_search: 'Thực đơn phù hợp',
  article_search: 'Bài viết liên quan',
  site_content_search: 'Thông tin website',
  table_availability: 'Tình trạng bàn',
};

const SITE_ROUTE_SUMMARIES = [
  {
    slug: 'home',
    label: 'Trang chủ / thực đơn',
    path: '/',
    keywords: ['trang chu', 'thuc don', 'menu', 'mon an', 'gio hang'],
    summary:
      'Trang chủ cho phép xem danh mục món, giá, ảnh, thêm vào giỏ và mở trang chi tiết món ăn.',
  },
  {
    slug: 'ar',
    label: 'Trang AR',
    path: '/ar',
    keywords: ['ar', '3d', 'quick look', 'scene viewer', 'webxr'],
    summary:
      'Trang AR dùng để xem mô hình 3D/AR của món ăn trên iOS và Android.',
  },
  {
    slug: 'blog',
    label: 'Trang blog',
    path: '/blog',
    keywords: ['blog', 'bai viet', 'tin tuc', 'khuyen mai'],
    summary:
      'Trang blog hiển thị bài viết, chia sẻ và tin tức của nhà hàng.',
  },
  {
    slug: 'contact',
    label: 'Trang liên hệ',
    path: '/contact',
    keywords: ['lien he', 'hotline', 'dia chi', 'dat ban', 'support'],
    summary:
      'Trang liên hệ cung cấp hotline, email, giờ phục vụ, biểu mẫu đặt bàn và hỗ trợ AR.',
  },
  {
    slug: 'about',
    label: 'Trang giới thiệu',
    path: '/about',
    keywords: ['gioi thieu', 'about', 'su menh', 'tam nhin', 'gia tri cot loi'],
    summary:
      'Trang giới thiệu kể về câu chuyện thương hiệu, sứ mệnh, tầm nhìn và trải nghiệm AR của Sakura.',
  },
  {
    slug: 'career',
    label: 'Trang tuyển dụng',
    path: '/career',
    keywords: ['career', 'tuyen dung', 'ung tuyen', 'viec lam'],
    summary:
      'Trang tuyển dụng mô tả cơ hội nghề nghiệp, môi trường làm việc và cách ứng tuyển.',
  },
  {
    slug: 'press-kit',
    label: 'Trang press kit',
    path: '/press-kit',
    keywords: ['press kit', 'bao chi', 'truyen thong', 'doi tac'],
    summary:
      'Trang press kit dành cho báo chí và đối tác truyền thông, gồm thông tin liên hệ và tài nguyên truyền thông.',
  },
  {
    slug: 'privacy-policy',
    label: 'Trang chính sách bảo mật',
    path: '/privacy&policy',
    keywords: ['privacy', 'bao mat', 'chinh sach', 'du lieu', 'camera', 'vr', 'webxr', 'quyen rieng tu'],
    summary:
      'Trang chính sách bảo mật trình bày cách Sakura xử lý và bảo vệ dữ liệu người dùng.',
  },
  {
    slug: 'terms-of-service',
    label: 'Trang điều khoản dịch vụ',
    path: '/term&service',
    keywords: ['terms', 'dieu khoan', 'dich vu', 'thanh toan', 'dat ban'],
    summary:
      'Trang điều khoản dịch vụ mô tả các quy định khi sử dụng website và dịch vụ của Sakura.',
  },
  {
    slug: 'cart',
    label: 'Trang giỏ hàng',
    path: '/cart',
    keywords: ['gio hang', 'cart', 'checkout', 'thanh toan'],
    summary:
      'Trang giỏ hàng cho phép xem món đã chọn, chỉnh số lượng và bắt đầu đặt món hoặc thanh toán.',
  },
  {
    slug: 'order-history',
    label: 'Trang lịch sử đơn',
    path: '/orders/history',
    keywords: ['lich su don', 'order history', 'don hang'],
    summary:
      'Trang lịch sử đơn hàng hiển thị đơn tại bàn và đơn takeaway của khách.',
  },
];

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function clipText(value = '', maxLength = MAX_TOOL_CONTEXT_LENGTH) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function uniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

function uniqueActions(actions = []) {
  const seen = new Set();

  return actions.filter((action) => {
    if (!action?.type || !action?.label) return false;
    const target = action.path || action.prompt || '';
    const key = `${action.type}:${target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function flattenContentText(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => flattenContentText(item)).filter(Boolean).join(' ');
  }
  if (typeof value === 'object') {
    return Object.values(value)
      .map((item) => flattenContentText(item))
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

function parseMoneyFragment(fragment) {
  const text = normalizeText(fragment);
  const rawValue = Number(text.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(rawValue) || rawValue <= 0) return null;

  if (text.includes('tr')) return Math.round(rawValue * 1_000_000);
  if (text.includes('k') || text.includes('nghin')) return Math.round(rawValue * 1_000);

  return Math.round(rawValue);
}

function extractPriceBudget(message) {
  const normalized = normalizeText(message);
  const underMatch = normalized.match(/(?:duoi|toi da|khong qua|max)\s*([\d.,]+(?:\s*(?:k|nghin|tr|trieu))?)/);
  const overMatch = normalized.match(/(?:tren|tu)\s*([\d.,]+(?:\s*(?:k|nghin|tr|trieu))?)/);

  return {
    max: underMatch ? parseMoneyFragment(underMatch[1]) : null,
    min: overMatch ? parseMoneyFragment(overMatch[1]) : null,
  };
}

function extractPartySize(message) {
  const match = normalizeText(message).match(/(\d+)\s*(?:nguoi|khach|phan)/);
  if (!match) return null;
  const count = Number(match[1]);
  return Number.isFinite(count) && count > 0 ? count : null;
}

function extractPhoneNumber(message) {
  const match = String(message || '').match(/(?:\+?84|0)\d[\d\s.-]{7,12}\d/);
  return match ? match[0].replace(/[^\d+]/g, '') : '';
}

function extractReservationDate(message) {
  const text = normalizeText(message);
  const isoMatch = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
    };
  }

  const vnMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](20\d{2}))?\b/);
  if (vnMatch) {
    const now = new Date();
    return {
      year: vnMatch[3] ? Number(vnMatch[3]) : now.getFullYear(),
      month: Number(vnMatch[2]),
      day: Number(vnMatch[1]),
    };
  }

  const now = new Date();
  if (text.includes('ngay mai') || text.includes('tomorrow')) {
    const target = new Date(now);
    target.setDate(target.getDate() + 1);
    return { year: target.getFullYear(), month: target.getMonth() + 1, day: target.getDate() };
  }

  if (text.includes('hom nay') || text.includes('today')) {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }

  return null;
}

function extractReservationTime(message) {
  const normalized = normalizeText(message);
  const match = normalized.match(/\b(\d{1,2})(?::|h)(\d{2})?\b/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  if (hour < 12 && hasAnyKeyword(normalized, ['toi', 'chieu', 'pm'])) hour += 12;
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour > 23 || minute > 59) return null;

  return { hour, minute };
}

function extractCustomerName(message) {
  const raw = String(message || '');
  const match = raw.match(/(?:tên|ten|name)(?:\s+tôi|\s+toi)?\s*(?:là|la|:)?\s*([A-Za-zÀ-ỹ\s]{2,40})(?=,|\.|;|\s+(?:sdt|số|so|phone|lúc|luc|ngày|ngay|\d)|$)/i);
  if (match) return match[1].trim();

  const leadingSegment = raw.split(',')[0]?.trim() || '';
  if (
    leadingSegment &&
    !/\d/.test(leadingSegment) &&
    leadingSegment.length >= 2 &&
    leadingSegment.length <= 40 &&
    !/(dat ban|reservation|book ban|xac nhan|confirm|toi muon|giup toi)/i.test(leadingSegment)
  ) {
    return leadingSegment;
  }

  return '';
}

function extractPreferredTableCode(message) {
  const raw = String(message || '').toUpperCase();
  const explicitCodeMatch = raw.match(/\bT\s?(\d{1,2})\b/);
  if (explicitCodeMatch) {
    return `T${String(explicitCodeMatch[1]).padStart(2, '0')}`;
  }

  const tableMatch = normalizeText(message).match(/(?:ban|table)\s*(\d{1,2})\b/);
  if (tableMatch) {
    return `T${String(tableMatch[1]).padStart(2, '0')}`;
  }

  return '';
}

function buildReservationDateTime(message) {
  const date = extractReservationDate(message);
  const time = extractReservationTime(message);
  if (!date || !time) return null;

  const reservationTime = new Date(date.year, date.month - 1, date.day, time.hour, time.minute, 0, 0);
  if (Number.isNaN(reservationTime.getTime())) return null;
  return reservationTime;
}

function extractBookingPayload(message, noteMessage = null) {
  const reservationTime = buildReservationDateTime(message);
  return {
    customer_name: extractCustomerName(message),
    customer_phone: extractPhoneNumber(message),
    party_size: extractPartySize(message),
    reservation_time: reservationTime,
    preferred_table_code: extractPreferredTableCode(message),
    note: String(noteMessage ?? message ?? '').trim(),
  };
}

function hasBookingPayloadSignal(message) {
  const payload = extractBookingPayload(message);
  return Boolean(payload.customer_name || payload.customer_phone || payload.party_size || payload.reservation_time);
}

function isBookingConversationActive(history = [], conversationSummary = '') {
  const summaryText = normalizeText(conversationSummary);
  if (summaryText.includes('intent booking_support') || summaryText.includes('intent booking_followup')) {
    return true;
  }

  return history.some((entry) => {
    const content = normalizeText(entry?.content || '');
    return content.includes('dat ban') || content.includes('reservation') || content.includes('book ban');
  });
}

function hasAnyKeyword(message, keywords) {
  const normalized = normalizeText(message);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function detectIntent(message, history = [], conversationSummary = '') {
  const hasBookingKeyword = hasAnyKeyword(message, ['dat ban', 'reservation', 'book ban']);
  const bookingFollowup =
    isBookingConversationActive(history, conversationSummary) &&
    (hasBookingPayloadSignal(message) || hasBookingKeyword || isBookingConfirmationMessage(message) || Boolean(extractPreferredTableCode(message)));

  if (hasAnyKeyword(message, TABLE_AVAILABILITY_KEYWORDS)) {
    return 'table_availability';
  }

  if (hasAnyKeyword(message, ['du lieu', 'bao mat', 'privacy', 'quyen rieng tu', 'camera', 'thu thap', 'vr'])) {
    return 'site_info';
  }

  if (hasAnyKeyword(message, ['quick look', 'scene viewer', 'webxr', 'ar', '3d', 'qr', 'quét', 'quet'])) {
    return 'ar_support';
  }

  if (hasAnyKeyword(message, ['thanh toan', 'sepay', 'cod', 'qr chuyen khoan', 'hoan tien', 'payment'])) {
    return 'payment_support';
  }

  if (hasAnyKeyword(message, CONTENT_DISCOVERY_KEYWORDS)) {
    return 'content_discovery';
  }

  if (hasAnyKeyword(message, SITE_CONTENT_KEYWORDS)) {
    return 'site_info';
  }

  if (bookingFollowup) {
    return 'booking_followup';
  }

  if (hasBookingKeyword) {
    return 'booking_support';
  }

  if (hasAnyKeyword(message, ['gio mo cua', 'gio dong cua', 'mo cua', 'dong cua', 'dia chi', 'hotline', 'lien he', 'email', 'so dien thoai', 'phone'])) {
    return 'contact_info';
  }

  if (hasAnyKeyword(message, ['giao hang', 'mang ve', 'takeaway', 'delivery', 'dat mon', 'order'])) {
    return 'order_support';
  }

  if (hasAnyKeyword(message, MENU_DISCOVERY_KEYWORDS)) {
    return 'menu_recommendation';
  }

  return 'general';
}

function extractMenuPreferences(message, categories = []) {
  const normalized = normalizeText(message);
  const normalizedCategories = categories.map((category) => ({
    raw: category,
    normalized: normalizeText(category),
  }));

  const ingredientKeywords = [
    'salmon',
    'ca hoi',
    'tuna',
    'bo',
    'heo',
    'ga',
    'tom',
    'cua',
    'eel',
    'unagi',
    'avocado',
    'trung',
    'rong bien',
    'nam',
    'dau hu',
  ];

  const matchedCategories = normalizedCategories
    .filter((entry) => normalized.includes(entry.normalized))
    .map((entry) => entry.raw);

  const desiredIngredients = ingredientKeywords.filter((keyword) => normalized.includes(keyword));
  const budget = extractPriceBudget(message);
  const partySize = extractPartySize(message);
  const avoidIngredients = [];

  const matches = normalized.matchAll(/(?:khong an|tranh|di ung|khong muon co)\s+([a-z0-9\s,]+)/g);
  for (const match of matches) {
    if (!match[1]) continue;
    const rawParts = match[1]
      .split(/,|va|hoac|\//)
      .map((part) => normalizeText(part))
      .filter(Boolean);
    avoidIngredients.push(...rawParts);
  }

  return {
    categories: matchedCategories,
    budget,
    partySize,
    onlyBestSeller: hasAnyKeyword(message, ['best seller', 'ban chay', 'noi bat', 'pho bien']),
    onlyWithAR: hasAnyKeyword(message, ['co ar', 'xem ar', '3d', 'quick look', 'scene viewer']),
    desiredIngredients,
    avoidIngredients: uniqueStrings(avoidIngredients),
  };
}

function buildMenuSearchText(message, history = [], conversationSummary = '') {
  const priorUserContext = history
    .filter((entry) => entry.role === 'user')
    .slice(-2)
    .map((entry) => entry.content)
    .join(' ');

  return `${conversationSummary} ${priorUserContext} ${message}`.trim();
}

function scoreMenuItem(item, searchText, preferences) {
  const haystack = normalizeText(
    [
      item.name,
      item.category,
      item.description,
      ...(item.ingredients || []),
      ...(item.recommended_for || []),
    ].join(' '),
  );

  let score = 0;
  const normalizedSearch = normalizeText(searchText);

  if (!normalizedSearch) score += 1;

  if (preferences.categories.length > 0 && preferences.categories.includes(item.category)) score += 4;
  if (preferences.onlyBestSeller && item.is_best_seller) score += 3;
  if (preferences.onlyWithAR && (item.ar_models?.glb_url || item.ar_models?.usdz_url)) score += 3;
  if (!preferences.partySize && item.is_best_seller) score += 1;

  for (const keyword of preferences.desiredIngredients) {
    if (haystack.includes(keyword)) score += 3;
  }

  for (const keyword of preferences.avoidIngredients) {
    if (keyword && haystack.includes(keyword)) score -= 10;
  }

  if (normalizedSearch && haystack.includes(normalizedSearch)) score += 6;

  const searchTokens = normalizedSearch.split(/\s+/).filter((token) => token.length >= 3);
  score += searchTokens.filter((token) => haystack.includes(token)).length;

  if (preferences.budget.max && Number(item.price || 0) <= preferences.budget.max) score += 2;
  if (preferences.budget.min && Number(item.price || 0) >= preferences.budget.min) score += 1;

  return score;
}

function filterMenuItems(items, preferences) {
  return items.filter((item) => {
    if (preferences.categories.length > 0 && !preferences.categories.includes(item.category)) return false;
    if (preferences.onlyBestSeller && !item.is_best_seller) return false;
    if (preferences.onlyWithAR && !item.ar_models?.glb_url && !item.ar_models?.usdz_url) return false;
    if (preferences.budget.max && Number(item.price || 0) > preferences.budget.max) return false;
    if (preferences.budget.min && Number(item.price || 0) < preferences.budget.min) return false;

    const haystack = normalizeText(
      [
        item.name,
        item.category,
        item.description,
        ...(item.ingredients || []),
        ...(item.allergens || []),
      ].join(' '),
    );

    return !preferences.avoidIngredients.some((keyword) => keyword && haystack.includes(keyword));
  });
}

function formatMenuItemForContext(item) {
  const profile = [
    item.is_best_seller ? 'bán chạy' : null,
    item.ar_models?.glb_url || item.ar_models?.usdz_url ? 'có AR' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const details = [
    `- ${item.name} (${item.category}): ${formatCurrency(item.price)} VND`,
    item.description ? `Mô tả: ${clipText(item.description, 120)}` : null,
    item.ingredients?.length ? `Nguyên liệu: ${clipText(item.ingredients.join(', '), 100)}` : null,
    item.allergens?.length ? `Lưu ý dị ứng: ${clipText(item.allergens.join(', '), 100)}` : null,
    item.recommended_for?.length ? `Phù hợp: ${clipText(item.recommended_for.join(', '), 100)}` : null,
    profile ? `Thuộc tính: ${profile}` : null,
  ].filter(Boolean);

  return clipText(details.join('. '), 260);
}

function buildMenuCard(item) {
  const badges = [
    item.is_best_seller ? 'Bán chạy' : null,
    item.ar_models?.glb_url || item.ar_models?.usdz_url ? 'Có AR' : null,
  ].filter(Boolean);

  const actions = [
    {
      type: 'navigate',
      label: 'Xem chi tiết',
      path: `/menu/${item._id}`,
    },
    {
      type: 'navigate',
      label: 'Xem thực đơn',
      path: CHAT_KNOWLEDGE_BASE.quickLinks.home,
    },
  ];

  if (item.ar_models?.glb_url || item.ar_models?.usdz_url) {
    actions.unshift({
      type: 'navigate',
      label: 'Mở AR',
      path: `${CHAT_KNOWLEDGE_BASE.quickLinks.ar}?itemId=${item._id}`,
    });
  }

  return {
    type: 'menu_item',
    title: item.name,
    subtitle: `${formatCurrency(item.price)} VND`,
    description: item.description || 'Món ăn nổi bật trong thực đơn Sakura.',
    imageUrl: item.image_url || '',
    badges,
    actions,
  };
}

function buildArticleCard(article) {
  return {
    type: 'article',
    title: article.title,
    subtitle: article.category || 'Blog',
    description: clipText(String(article.content || ''), 140),
    imageUrl: article.image_url || '',
    badges: [new Date(article.createdAt).toLocaleDateString('vi-VN')],
    actions: [
      {
        type: 'navigate',
        label: 'Đọc bài viết',
        path: `${CHAT_KNOWLEDGE_BASE.quickLinks.blog}/${article._id}`,
      },
    ],
  };
}

function scoreFaqEntry(entry, normalizedMessage, intent) {
  const haystack = normalizeText(`${entry.question} ${entry.answer}`);
  const tokenScore = normalizedMessage
    .split(/\s+/)
    .filter((token) => token.length >= 3 && haystack.includes(token)).length;

  if (tokenScore > 0) return tokenScore;

  if (intent === 'ar_support' && haystack.includes('ar')) return 1;
  if (intent === 'order_support' && haystack.includes('dat mon')) return 1;
  if (intent === 'content_discovery' && haystack.includes('bai viet')) return 1;

  return 0;
}

function getRelevantFaqEntries(message, intent) {
  const normalizedMessage = normalizeText(message);
  const matches = CHAT_KNOWLEDGE_BASE.faq
    .map((entry) => ({
      entry,
      score: scoreFaqEntry(entry, normalizedMessage, intent),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((item) => item.entry);

  if (matches.length > 0) return matches;

  switch (intent) {
    case 'ar_support':
      return CHAT_KNOWLEDGE_BASE.faq.slice(0, 1);
    case 'order_support':
      return CHAT_KNOWLEDGE_BASE.faq.slice(1, 3);
    case 'content_discovery':
      return CHAT_KNOWLEDGE_BASE.faq.slice(3, 4);
    default:
      return [];
  }
}

function buildRestaurantInfoTool({ intent, message, currentPath = '', topic = '' }) {
  const { restaurant, booking, ar, payments, quickLinks } = CHAT_KNOWLEDGE_BASE;
  const lines = [];
  const actions = [];
  const effectiveIntent = topic || intent;
  const faqEntries = getRelevantFaqEntries(message, effectiveIntent);
  const normalizedPath = normalizeText(currentPath);

  if (effectiveIntent === 'contact_info') {
    lines.push(`Giờ phục vụ: ${restaurant.hours}. Bếp nhận order cuối lúc ${restaurant.lastKitchenOrder}.`);
    lines.push(`Địa chỉ: ${restaurant.address.join(', ')}.`);
    lines.push(`Hotline: ${restaurant.hotline.join(' / ')}.`);
    lines.push(`Email hỗ trợ: ${restaurant.emails.support}.`);
    actions.push({ type: 'navigate', label: 'Liên hệ nhà hàng', path: quickLinks.contact });
  } else if (effectiveIntent === 'booking_support') {
    lines.push(`Đặt bàn: ${booking.summary}`);
    lines.push(`Khi đến bàn: ${booking.dineIn}`);
    lines.push(`Hotline hỗ trợ nhanh: ${restaurant.hotline.join(' / ')}.`);
    actions.push({ type: 'navigate', label: 'Liên hệ / đặt bàn', path: quickLinks.contact });
  } else if (effectiveIntent === 'table_availability') {
    lines.push(`Đặt bàn: ${booking.summary}`);
    lines.push(`Nếu cần giữ chỗ nhanh, khách nên liên hệ hotline ${restaurant.hotline.join(' / ')} hoặc điền form tại trang liên hệ.`);
    actions.push({ type: 'navigate', label: 'Liên hệ / đặt bàn', path: quickLinks.contact });
  } else if (effectiveIntent === 'order_support') {
    lines.push(`Gọi món tại bàn: ${booking.dineIn}`);
    lines.push(`Mang về/giao hàng: ${booking.takeaway}`);
    actions.push({ type: 'navigate', label: 'Mở giỏ hàng', path: quickLinks.cart });
    actions.push({ type: 'navigate', label: 'Lịch sử đơn', path: quickLinks.orderHistory });
  } else if (effectiveIntent === 'payment_support') {
    lines.push(`Thanh toán: ${payments.summary}`);
    lines.push(`Phương thức hiện có: ${payments.methods.join(', ')}.`);
    lines.push(`Hoàn tiền/hỗ trợ giao dịch: ${payments.refund}`);
    actions.push({ type: 'navigate', label: 'Mở giỏ hàng', path: quickLinks.cart });
  } else if (effectiveIntent === 'ar_support') {
    lines.push(`AR: ${ar.summary}`);
    lines.push(`iOS: ${ar.ios}`);
    lines.push(`Android: ${ar.android}`);
    lines.push(`Hỗ trợ khi AR lỗi: ${ar.support}`);
    lines.push(`Wifi khách: ${restaurant.guestWifi}.`);
    actions.push({ type: 'navigate', label: 'Trải nghiệm AR', path: quickLinks.ar });
  } else if (effectiveIntent === 'content_discovery') {
    lines.push('Nhà hàng có khu vực blog/bài viết để đăng tin tức, chia sẻ và chương trình khuyến mãi.');
    actions.push({ type: 'navigate', label: 'Xem blog', path: quickLinks.blog });
  } else if (effectiveIntent === 'site_info') {
    lines.push('Nhà hàng có các trang public để cung cấp thông tin về thương hiệu, liên hệ, tuyển dụng, press kit, chính sách và điều khoản.');
    if (normalizedPath.includes('/privacy&policy')) {
      lines.push('Trang hiện tại là chính sách bảo mật, tập trung vào dữ liệu thu thập, quyền riêng tư và quyền kiểm soát của người dùng.');
    }
    if (normalizedPath.includes('/term&service')) {
      lines.push('Trang hiện tại là điều khoản dịch vụ, tập trung vào quy định sử dụng, thanh toán, hoàn tiền và trách nhiệm của người dùng.');
    }
  } else {
    lines.push(`${restaurant.name}: ${restaurant.positioning}`);
    lines.push(`Hỗ trợ chính: thực đơn, AR, đặt bàn, thanh toán và blog.`);
    if (normalizedPath.includes('/contact')) {
      lines.push(`Giờ phục vụ: ${restaurant.hours}. Hotline: ${restaurant.hotline.join(' / ')}.`);
    }
    if (normalizedPath.includes('/ar')) {
      lines.push(`Trang hiện tại liên quan AR. iOS dùng Quick Look, Android dùng Scene Viewer hoặc WebXR.`);
    }
    actions.push({ type: 'navigate', label: 'Xem thực đơn', path: quickLinks.home });
  }

  if (faqEntries.length > 0) {
    lines.push(
      `FAQ liên quan: ${faqEntries
        .map((entry) => `${entry.question} -> ${entry.answer}`)
        .join(' | ')}`,
    );
  }

  return {
    name: 'restaurant_info',
    context: clipText(lines.join('\n'), MAX_TOOL_CONTEXT_LENGTH),
    actions: uniqueActions(actions),
    cards: [],
    items: [],
    articles: [],
  };
}

function buildSiteEntry(page) {
  const routeMeta = SITE_ROUTE_SUMMARIES.find((entry) => entry.slug === page.slug) || {};
  const contentText = flattenContentText(page.content);
  return {
    slug: page.slug,
    path: routeMeta.path || `/${page.slug}`,
    label: routeMeta.label || page.label || page.slug,
    keywords: routeMeta.keywords || [],
    summary: routeMeta.summary || '',
    contentText: clipText(contentText, 520),
  };
}

function buildSyntheticSiteEntries() {
  const defaultPages = new Map(STATIC_PAGE_DEFAULTS.map((page) => [page.slug, page]));

  return SITE_ROUTE_SUMMARIES.map((entry) => {
    const defaultPage = defaultPages.get(entry.slug);
    return buildSiteEntry({
      slug: entry.slug,
      label: defaultPage?.label || entry.label,
      content: defaultPage?.content || {},
    });
  });
}

function scoreSiteEntry(entry, searchText = '', currentPath = '') {
  const haystack = normalizeText(
    [entry.slug, entry.label, entry.summary, entry.contentText, ...(entry.keywords || [])].join(' '),
  );
  const normalizedSearch = normalizeText(searchText);
  const normalizedPath = normalizeText(String(currentPath || '').split('?')[0]);

  let score = 0;

  if (normalizedPath && normalizeText(entry.path) === normalizedPath) score += 5;
  if (normalizedSearch.includes(normalizeText(entry.slug))) score += 3;
  if (normalizedSearch.includes(normalizeText(entry.label))) score += 3;

  const tokens = normalizedSearch.split(/\s+/).filter((token) => token.length >= 3);
  score += tokens.filter((token) => haystack.includes(token)).length;

  return score;
}

function formatSiteEntryForContext(entry) {
  const pieces = [
    `- ${entry.label} (${entry.path})`,
    entry.summary ? `Tóm tắt: ${clipText(entry.summary, 150)}` : null,
    entry.contentText ? `Nội dung liên quan: ${clipText(entry.contentText, 180)}` : null,
  ].filter(Boolean);

  return pieces.join('. ');
}

function pickRecommendedSiteActions(entries, message = '', currentPath = '') {
  const normalizedMessage = normalizeText(message);
  const normalizedPath = normalizeText(String(currentPath || '').split('?')[0]);
  const isBroadWebsiteQuery = hasAnyKeyword(message, ['web', 'website', 'trang web', 'trang nao', 'co nhung trang']);

  if (entries.length === 0) return [];

  let actionEntries = entries;

  if (!isBroadWebsiteQuery) {
    const exactPathEntry = entries.find((entry) => normalizeText(entry.path) === normalizedPath);
    if (exactPathEntry && normalizedMessage.includes(normalizeText(exactPathEntry.label))) {
      actionEntries = [exactPathEntry];
    } else {
      actionEntries = [entries[0]];
    }
  } else {
    actionEntries = entries.slice(0, 3);
  }

  return uniqueActions(
    actionEntries.map((entry) => ({
      type: 'navigate',
      label: `Mở ${entry.label}`,
      path: entry.path,
    })),
  );
}

async function getRelevantSiteContent(message, currentPath = '', conversationSummary = '', options = {}) {
  let staticPages = [];
  try {
    staticPages = await getStaticPages();
  } catch (error) {
    console.warn('[chat] Static page source unavailable, using synthetic website knowledge', {
      message: error?.message,
    });
  }
  const overrideQuery = String(options.query || '').trim();
  const preferredSlug = String(options.slug || '').trim();
  const searchText = `${conversationSummary} ${overrideQuery || message}`.trim();
  const entries = [
    ...staticPages.map(buildSiteEntry),
    ...buildSyntheticSiteEntries(),
  ].filter((entry, index, list) => list.findIndex((candidate) => candidate.slug === entry.slug) === index);

  const scoredEntries = entries
    .map((entry) => ({
      entry,
      score: scoreSiteEntry(entry, searchText, currentPath),
    }))
    .sort((left, right) => right.score - left.score);

  let topEntries = scoredEntries.filter((item) => item.score > 0).slice(0, MAX_SITE_RESULT_ITEMS).map((item) => item.entry);

  if (topEntries.length === 0) {
    const currentPathMatch = entries.find(
      (entry) => normalizeText(entry.path) === normalizeText(String(currentPath || '').split('?')[0]),
    );
    if (currentPathMatch) {
      topEntries = [currentPathMatch];
    }
  }

  if (topEntries.length === 0 && hasAnyKeyword(message, ['web', 'website', 'trang web'])) {
    topEntries = entries.filter((entry) => ['home', 'ar', 'contact'].includes(entry.slug)).slice(0, 3);
  }

  if (hasAnyKeyword(message, ['web', 'website', 'trang web', 'trang nao'])) {
    const preferredOrder = ['home', 'about', 'contact', 'blog', 'career', 'press-kit'];
    topEntries = preferredOrder
      .map((slug) => entries.find((entry) => entry.slug === slug))
      .filter(Boolean)
      .slice(0, MAX_SITE_RESULT_ITEMS);
  }

  if (hasAnyKeyword(message, ['du lieu', 'bao mat', 'privacy', 'quyen rieng tu', 'camera', 'thu thap', 'vr'])) {
    topEntries = ['privacy-policy', 'terms-of-service', 'contact']
      .map((slug) => entries.find((entry) => entry.slug === slug))
      .filter(Boolean)
      .slice(0, 3);
  }

  if (preferredSlug) {
    const exactSlugMatch = entries.find((entry) => entry.slug === preferredSlug);
    if (exactSlugMatch) {
      topEntries = [exactSlugMatch];
    }
  }

  const recommendedActions = pickRecommendedSiteActions(topEntries, message, currentPath);

  return {
    name: 'site_content_search',
    items: [],
    articles: [],
    context:
      topEntries.length > 0
        ? topEntries.map(formatSiteEntryForContext).join('\n')
        : 'Chưa tìm thấy nội dung website thật sát câu hỏi này.',
    cards: [],
    actions: recommendedActions,
  };
}

function buildTableAvailabilityCard(table) {
  const statusLabel =
    table.status === 'empty' ? 'Đang trống' : table.status === 'reserved' ? 'Đã đặt trước' : 'Đang phục vụ';

  return {
    type: 'table_status',
    title: table.name,
    subtitle: `${table.zone || 'Main Hall'} • ${table.capacity || 0} khách`,
    description: `Trạng thái hiện tại: ${statusLabel}.`,
    imageUrl: '',
    badges: [statusLabel],
    actions: [{ type: 'navigate', label: 'Liên hệ đặt bàn', path: CHAT_KNOWLEDGE_BASE.quickLinks.contact }],
  };
}

async function getTableAvailability(message, options = {}) {
  const desiredPartySize =
    Number(options.partySize || 0) > 0 ? Number(options.partySize) : extractPartySize(message);
  const tables = await Table.find().select('name status zone capacity').sort({ name: 1 }).lean();
  const emptyTables = tables.filter((table) => table.status === 'empty');
  const reservedTables = tables.filter((table) => table.status === 'reserved');
  const diningTables = tables.filter((table) => table.status === 'dining');
  const matchingTables = desiredPartySize
    ? emptyTables.filter((table) => Number(table.capacity || 0) >= desiredPartySize)
    : emptyTables;
  const displayTables = matchingTables.slice(0, MAX_TABLE_RESULT_ITEMS);

  const lines = [
    `Tổng số bàn hiện có: ${tables.length}.`,
    `Đang trống: ${emptyTables.length}. Đã đặt trước: ${reservedTables.length}. Đang phục vụ: ${diningTables.length}.`,
  ];

  if (desiredPartySize) {
    lines.push(`Bàn trống phù hợp cho ít nhất ${desiredPartySize} khách: ${matchingTables.length}.`);
  }

  if (displayTables.length > 0) {
    lines.push(
      `Danh sách bàn trống nổi bật: ${displayTables
        .map((table) => `${table.name} (${table.zone || 'Main Hall'}, ${table.capacity || 0} khách)`)
        .join('; ')}.`,
    );
  } else {
    lines.push('Hiện chưa có bàn trống phù hợp rõ ràng trong dữ liệu trạng thái hiện tại.');
  }

  return {
    name: 'table_availability',
    items: displayTables,
    articles: [],
    context: clipText(lines.join('\n'), MAX_TOOL_CONTEXT_LENGTH),
    cards: displayTables.slice(0, 4).map(buildTableAvailabilityCard),
    actions: uniqueActions([
      { type: 'navigate', label: 'Liên hệ / đặt bàn', path: CHAT_KNOWLEDGE_BASE.quickLinks.contact },
    ]),
  };
}

async function buildTableTypeSummary() {
  const tables = await Table.find().select('name zone capacity').sort({ capacity: 1, name: 1 }).lean();
  if (tables.length === 0) {
    return {
      summary: 'Hiện chưa đọc được dữ liệu loại bàn từ hệ thống.',
      capacitySummary: '',
      zoneSummary: '',
    };
  }

  const capacityMap = new Map();
  const zoneMap = new Map();

  for (const table of tables) {
    const capacity = Number(table.capacity || 0);
    const zone = String(table.zone || 'Main Hall');

    if (!capacityMap.has(capacity)) capacityMap.set(capacity, 0);
    capacityMap.set(capacity, Number(capacityMap.get(capacity)) + 1);

    if (!zoneMap.has(zone)) zoneMap.set(zone, []);
    zoneMap.get(zone).push(table);
  }

  const capacitySummary = [...capacityMap.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([capacity, count]) => `${count} bàn ${capacity} khách`)
    .join(', ');

  const zoneSummary = [...zoneMap.entries()]
    .map(([zone, zoneTables]) => {
      const capacities = [...new Set(zoneTables.map((item) => Number(item.capacity || 0)))].sort((a, b) => a - b);
      return `${zone} (${capacities.join('/')} khách)`;
    })
    .join('; ');

  return {
    summary: `Nhà hàng hiện có các nhóm bàn theo sức chứa: ${capacitySummary}. Khu vực nổi bật: ${zoneSummary}.`,
    capacitySummary,
    zoneSummary,
  };
}

function mergeBookingDraft(baseDraft = {}, nextDraft = {}) {
  return {
    customer_name: nextDraft.customer_name || baseDraft.customer_name || '',
    customer_phone: nextDraft.customer_phone || baseDraft.customer_phone || '',
    party_size: nextDraft.party_size || baseDraft.party_size || null,
    reservation_time: nextDraft.reservation_time || baseDraft.reservation_time || null,
    preferred_table_code: nextDraft.preferred_table_code || baseDraft.preferred_table_code || '',
    preferred_table_id: nextDraft.preferred_table_id || baseDraft.preferred_table_id || '',
    preferred_table_name: nextDraft.preferred_table_name || baseDraft.preferred_table_name || '',
    note: nextDraft.note || baseDraft.note || '',
  };
}

function isBookingConfirmationMessage(message = '') {
  return hasAnyKeyword(message, ['xac nhan', 'confirm', 'dong y', 'ok dat ban', 'hoan tat dat ban']);
}

function getNormalizedTableCode(name = '') {
  const explicitCodeMatch = String(name || '').toUpperCase().match(/\bT\s?(\d{1,2})\b/);
  if (explicitCodeMatch) {
    return `T${String(explicitCodeMatch[1]).padStart(2, '0')}`;
  }

  const digits = String(name || '').match(/\d+/)?.[0];
  return digits ? `T${String(digits).padStart(2, '0')}` : '';
}

async function resolvePreferredTable(code = '') {
  if (!code) return null;

  const tables = await Table.find().select('_id name zone capacity status').sort({ name: 1 }).lean();
  return tables.find((table) => getNormalizedTableCode(table.name) === code) || null;
}

async function createReservationFromChat(message, options = {}) {
  const extractionMessage = options.query ? `${message}\n${String(options.query).trim()}` : message;
  const tableTypeSummary = await buildTableTypeSummary();
  const sessionDraft = options.bookingDraft || {};
  const extractedPayload = {
    ...extractBookingPayload(extractionMessage, message),
  };
  const mergedDraft = mergeBookingDraft(sessionDraft, extractedPayload);
  const preferredTableCode = mergedDraft.preferred_table_code || '';
  const preferredTable = preferredTableCode ? await resolvePreferredTable(preferredTableCode) : null;
  const payload = {
    customer_name: mergedDraft.customer_name || '',
    customer_phone: mergedDraft.customer_phone || '',
    party_size: mergedDraft.party_size || null,
    reservation_time: mergedDraft.reservation_time || null,
    table: preferredTable?._id,
    note: mergedDraft.note || String(message || '').trim(),
    source: 'ai',
  };

  if (options.conversationId) {
    updateConversationMetadata(options.conversationId, {
      bookingDraft: {
        ...mergedDraft,
        preferred_table_id: preferredTable?._id ? String(preferredTable._id) : '',
        preferred_table_name: preferredTable?.name || mergedDraft.preferred_table_name || '',
      },
    });
  }

  const missingFields = [];

  if (!payload.customer_name) missingFields.push('tên khách');
  if (!payload.customer_phone) missingFields.push('số điện thoại');
  if (!payload.party_size) missingFields.push('số lượng khách');
  if (!payload.reservation_time) missingFields.push('ngày và giờ đặt');

  if (missingFields.length > 0) {
    const completedDetails = [
      payload.customer_name ? `Tên khách: ${payload.customer_name}` : null,
      payload.customer_phone ? `SĐT: ${payload.customer_phone}` : null,
      payload.party_size ? `Số khách: ${payload.party_size}` : null,
      payload.reservation_time ? `Thời gian: ${new Date(payload.reservation_time).toLocaleString('vi-VN')}` : null,
      preferredTable?.name ? `Bàn đã chọn: ${preferredTable.name}` : preferredTableCode ? `Bàn đã chọn: ${preferredTableCode}` : null,
    ].filter(Boolean);
    const selectedTableHint = preferredTable?.name
      ? ` Mình đã ghi nhận bạn muốn ưu tiên ${preferredTable.name}.`
      : preferredTableCode
        ? ` Mình đã ghi nhận bạn muốn ưu tiên ${preferredTableCode}.`
        : '';
    const combinedReply = `Mình có thể đặt bàn giúp bạn.${selectedTableHint} Bạn không cần tự biết trước loại bàn nếu chưa chắc, hệ thống sẽ ưu tiên bàn phù hợp theo số khách. ${tableTypeSummary.summary} Bạn gửi giúp mình đầy đủ ${missingFields.join(', ')} trong cùng một tin nhắn nhé. Ví dụ: "Tôi tên Nguyễn Văn An, số điện thoại 0901234567, đặt bàn cho 4 người lúc 19h ngày 24/05/2026."`;
    const combinedSuggestions = [
      {
        label: 'Gửi đủ thông tin',
        prompt: 'Tôi tên Nguyễn Văn An, số điện thoại 0901234567, đặt bàn cho 4 người lúc 19h ngày 24/05/2026.',
      },
      {
        label: 'Đặt bàn 2 người',
        prompt: 'Tôi tên Trần Minh Châu, số điện thoại 0987654321, muốn đặt bàn cho 2 người lúc 20h ngày 25/05/2026.',
      },
    ];

    return {
      name: 'reservation_booking',
      items: [],
      articles: [],
      cards: [
        {
          type: 'reservation_followup',
          title: 'Cần đủ thông tin để đặt bàn',
          subtitle: 'Gửi một tin nhắn gồm tên, số điện thoại, số khách, mã bàn và thời gian đặt',
          description: combinedReply,
          imageUrl: '',
          badges: ['Thiếu dữ liệu đặt chỗ'],
          metaRows: [
            { label: 'Đã nhận', value: completedDetails.length > 0 ? completedDetails.join(' • ') : 'Chưa có thông tin hoàn chỉnh' },
            { label: 'Cần bổ sung', value: missingFields.join(', ') },
            { label: 'Loại bàn hiện có', value: tableTypeSummary.capacitySummary || 'Sẽ chọn bàn phù hợp theo số khách' },
          ],
          actions: [
            { type: 'navigate', label: 'Mở form đặt bàn', path: CHAT_KNOWLEDGE_BASE.quickLinks.contact },
          ],
        },
      ],
      actions: uniqueActions([{ type: 'navigate', label: 'Mở form đặt bàn', path: CHAT_KNOWLEDGE_BASE.quickLinks.contact }]),
      context: `AI chưa đủ thông tin để đặt bàn. Cần bổ sung: ${missingFields.join(', ')}. ${tableTypeSummary.summary} Hãy nói rõ rằng khách không cần biết trước tên bàn, hệ thống sẽ tự chọn bàn phù hợp theo số khách. Gợi ý trả lời: ${combinedReply}. Gợi ý follow-up: ${combinedSuggestions.map((item) => `${item.label}: ${item.prompt}`).join(' | ')}. Quy định: đặt trước tối thiểu 2 tiếng; bàn được giữ từ 90 phút trước giờ khách đến.`,
    };
  }

  let reservation;
  try {
    reservation = await createReservation(payload);
    if (options.io) {
      options.io.to('admin').emit('reservation_created', reservation);
    }
  } catch (error) {
    return {
      name: 'reservation_booking',
      items: [],
      articles: [],
      cards: [],
      actions: uniqueActions([{ type: 'navigate', label: 'Mở form đặt bàn', path: CHAT_KNOWLEDGE_BASE.quickLinks.contact }]),
      context: `Chưa thể tạo đặt bàn: ${error?.message || 'khung giờ không khả dụng'}. Hãy giải thích ngắn gọn cho khách và đề nghị chọn khung giờ khác nếu cần. Quy định: đặt trước tối thiểu 2 tiếng; bàn được giữ từ 90 phút trước giờ khách đến.`,
    };
  }

  const reservationTimeText = new Date(reservation.reservation_time).toLocaleString('vi-VN');
  const tableName = reservation.table?.name || 'bàn phù hợp';
  if (options.conversationId) {
    updateConversationMetadata(options.conversationId, {
      bookingDraft: null,
    });
  }
  return {
    name: 'reservation_booking',
    items: [reservation],
    articles: [],
    cards: [
      {
        type: 'reservation',
        title: `Đã đặt ${tableName}`,
        subtitle: reservationTimeText,
        description: `${reservation.customer_name} - ${reservation.party_size} khách. Khi tới quán, bạn chỉ cần cung cấp tên và số điện thoại để nhân viên xác nhận bàn đã đặt.`,
        imageUrl: '',
        badges: ['Đặt bàn thành công'],
        metaRows: [
          { label: 'Bàn', value: tableName },
          { label: 'Khách', value: `${reservation.party_size} người` },
          { label: 'Liên hệ', value: reservation.customer_phone },
        ],
        actions: [
          { type: 'navigate', label: 'Xem thực đơn', path: CHAT_KNOWLEDGE_BASE.quickLinks.home },
          { type: 'navigate', label: 'Xem liên hệ', path: CHAT_KNOWLEDGE_BASE.quickLinks.contact },
        ],
      },
    ],
    actions: [{ type: 'navigate', label: 'Xem thực đơn', path: CHAT_KNOWLEDGE_BASE.quickLinks.home }],
    context: `Đặt bàn thành công cho ${reservation.customer_name}, ${reservation.party_size} khách, lúc ${reservationTimeText}, tại ${tableName}. Khi tới quán, khách chỉ cần cung cấp tên và số điện thoại để nhân viên xác nhận bàn đã đặt.`,
  };
}

async function getRecommendedMenuItems(message, history = [], conversationSummary = '', options = {}) {
  const availableItems = await MenuItem.find({ is_available: true }).select(MENU_ITEM_FIELDS).lean();
  const categories = uniqueStrings(availableItems.map((item) => item.category));
  const overrideQuery = String(options.query || '').trim();
  const searchText = buildMenuSearchText(overrideQuery || message, history, conversationSummary);
  const preferences = extractMenuPreferences(searchText, categories);
  const filteredItems = filterMenuItems(availableItems, preferences);
  const candidates = filteredItems.length > 0 ? filteredItems : availableItems;

  const scoredItems = candidates
    .map((item) => ({
      item,
      score: scoreMenuItem(item, searchText, preferences),
    }))
    .sort((left, right) => right.score - left.score);

  const topItems = scoredItems.slice(0, 4).map((entry) => entry.item);

  return {
    name: 'menu_search',
    items: topItems,
    articles: [],
    context: topItems.length > 0 ? topItems.map(formatMenuItemForContext).join('\n') : 'Không tìm thấy món phù hợp rõ ràng.',
    cards: topItems.map(buildMenuCard),
    actions: uniqueActions([
      { type: 'navigate', label: 'Xem thực đơn', path: CHAT_KNOWLEDGE_BASE.quickLinks.home },
      topItems.some((item) => item.ar_models?.glb_url || item.ar_models?.usdz_url)
        ? { type: 'navigate', label: 'Mở AR', path: CHAT_KNOWLEDGE_BASE.quickLinks.ar }
        : null,
    ]),
  };
}

async function getRelatedArticles(message, conversationSummary = '', options = {}) {
  const articles = await Article.find({ is_published: true })
    .sort({ createdAt: -1, views: -1 })
    .limit(8)
    .lean();

  const overrideQuery = String(options.query || '').trim();
  const normalizedMessage = normalizeText(`${conversationSummary} ${overrideQuery || message}`);

  const scoredArticles = articles
    .map((article) => {
      const haystack = normalizeText([article.title, article.category, article.content].join(' '));
      const score = normalizedMessage
        .split(/\s+/)
        .filter((token) => token.length >= 3 && haystack.includes(token)).length;

      return {
        article,
        score,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        new Date(right.article.createdAt).getTime() - new Date(left.article.createdAt).getTime(),
    );

  const topArticles = scoredArticles.slice(0, 3).map((entry) => entry.article);

  return {
    name: 'article_search',
    items: [],
    articles: topArticles,
    context:
      topArticles.length > 0
        ? topArticles
            .map(
              (article) =>
                `- ${article.title} (${article.category || 'Blog'}): ${clipText(String(article.content || ''), 180)}`,
            )
            .join('\n')
        : 'Hiện chưa có bài viết phù hợp được xuất bản.',
    cards: topArticles.map(buildArticleCard),
    actions: uniqueActions([{ type: 'navigate', label: 'Xem blog', path: CHAT_KNOWLEDGE_BASE.quickLinks.blog }]),
  };
}

function buildFallbackToolSelection({ intent, message, currentPath = '' }) {
  const normalizedPath = normalizeText(currentPath);
  const selected = [];

  const addTool = (name, argumentsPayload = {}) => {
    if (!selected.some((tool) => tool.name === name)) {
      selected.push({
        id: `fallback_${name}`,
        name,
        arguments: argumentsPayload,
      });
    }
  };

  switch (intent) {
    case 'table_availability':
      addTool('table_availability', { query: message });
      addTool('restaurant_info', { topic: 'table_availability', focus: message });
      break;
    case 'menu_recommendation':
      addTool('menu_search', { query: message });
      break;
    case 'ar_support':
      addTool('restaurant_info', { topic: 'ar_support', focus: message });
      addTool('menu_search', { query: message });
      break;
    case 'content_discovery':
      addTool('article_search', { query: message });
      addTool('restaurant_info', { topic: 'content_discovery', focus: message });
      break;
    case 'site_info':
      addTool('site_content_search', { query: message });
      addTool('restaurant_info', { topic: 'site_info', focus: message });
      break;
    case 'contact_info':
    case 'payment_support':
    case 'order_support':
      addTool('restaurant_info', { topic: intent, focus: message });
      break;
    case 'booking_support':
    case 'booking_followup':
      addTool('reservation_booking', { query: message });
      addTool('restaurant_info', { topic: intent, focus: message });
      break;
    default:
      if (hasAnyKeyword(message, MENU_DISCOVERY_KEYWORDS) || normalizedPath === '/' || normalizedPath.includes('/menu')) {
        addTool('menu_search', { query: message });
      }
      if (hasAnyKeyword(message, CONTENT_DISCOVERY_KEYWORDS) || normalizedPath.includes('/blog')) {
        addTool('article_search', { query: message });
      }
      if (
        hasAnyKeyword(message, SITE_CONTENT_KEYWORDS) ||
        ['/about', '/contact', '/privacy&policy', '/term&service', '/career', '/press-kit'].some((path) =>
          normalizedPath.includes(path),
        )
      ) {
        addTool('site_content_search', { query: message });
      }
      if (hasAnyKeyword(message, TABLE_AVAILABILITY_KEYWORDS)) {
        addTool('table_availability', { query: message });
      }
      if (selected.length === 0 || hasAnyKeyword(message, SUPPORT_KEYWORDS) || normalizedPath.includes('/ar')) {
        addTool('restaurant_info', { topic: intent, focus: message });
      }
      break;
  }

  return selected;
}

function buildAiToolDefinitions() {
  return [
    {
      name: 'restaurant_info',
      description: 'Tra cứu thông tin vận hành nhà hàng như giờ mở cửa, hotline, địa chỉ, đặt bàn, AR, thanh toán hoặc hướng dẫn chung.',
      parameters: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            enum: [
              'general',
              'contact_info',
              'booking_support',
              'payment_support',
              'order_support',
              'ar_support',
              'site_info',
              'content_discovery',
              'table_availability',
            ],
          },
          focus: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'menu_search',
      description: 'Tìm các món ăn phù hợp theo nhu cầu hiện tại như loại món, giá, nguyên liệu, dị ứng, AR hoặc món bán chạy.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'article_search',
      description: 'Tìm bài viết, tin tức, blog hoặc khuyến mãi liên quan đến câu hỏi của khách.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'site_content_search',
      description: 'Tìm nội dung từ các trang public như Giới thiệu, Liên hệ, Tuyển dụng, Press Kit, Chính sách bảo mật và Điều khoản dịch vụ.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          slug: {
            type: 'string',
            enum: ['about', 'contact', 'career', 'press-kit', 'privacy-policy', 'terms-of-service', 'home', 'blog', 'ar', 'cart', 'order-history'],
          },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'table_availability',
      description: 'Kiểm tra trạng thái bàn trống hiện tại, số lượng bàn theo sức chứa và thông tin giữ chỗ.',
      parameters: {
        type: 'object',
        properties: {
          partySize: { type: 'number' },
          query: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'reservation_booking',
      description: 'Tạo đặt bàn khi khách đã cung cấp tên, số điện thoại, số khách, ngày và giờ đặt. Nếu thiếu thông tin, trả về các trường cần bổ sung.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        additionalProperties: false,
      },
    },
  ];
}

async function runSelectedTools({ selectedTools, intent, message, history, conversationSummary, currentPath, io, conversationId, bookingDraft }) {
  const results = [];
  const failedToolNames = [];
  const registry = {
    restaurant_info: async (argumentsPayload = {}) =>
      buildRestaurantInfoTool({
        intent,
        message: String(argumentsPayload.focus || message),
        currentPath,
        topic: String(argumentsPayload.topic || intent || 'general'),
      }),
    menu_search: async (argumentsPayload = {}) =>
      getRecommendedMenuItems(message, history, conversationSummary, {
        query: String(argumentsPayload.query || message),
      }),
    article_search: async (argumentsPayload = {}) =>
      getRelatedArticles(message, conversationSummary, {
        query: String(argumentsPayload.query || message),
      }),
    site_content_search: async (argumentsPayload = {}) =>
      getRelevantSiteContent(message, currentPath, conversationSummary, {
        query: String(argumentsPayload.query || message),
        slug: String(argumentsPayload.slug || ''),
      }),
    table_availability: async (argumentsPayload = {}) =>
      getTableAvailability(String(argumentsPayload.query || message), {
        partySize: Number(argumentsPayload.partySize || 0),
      }),
    reservation_booking: async (argumentsPayload = {}) => {
      const toolQuery = String(argumentsPayload.query || '').trim();
      return createReservationFromChat(message, {
        io,
        query: toolQuery,
        conversationId,
        bookingDraft,
      });
    },
  };

  for (const tool of selectedTools) {
    try {
      const executor = registry[tool.name];
      if (!executor) continue;
      results.push(await executor(tool.arguments || {}));
    } catch (error) {
      failedToolNames.push(tool.name);
      console.warn('[chat] Internal tool failed', {
        tool: tool.name,
        message: error?.message,
      });
    }
  }

  return {
    results,
    failedToolNames,
  };
}

function buildContextSections({ intent, currentPath, toolResults }) {
  const sections = [
    `Intent hiện tại: ${intent}`,
    currentPath ? `Khách đang ở trang: ${currentPath}` : null,
    ...toolResults
      .filter((result) => result.context)
      .map((result) => `${TOOL_LABELS[result.name] || result.name}:\n${clipText(result.context, MAX_TOOL_CONTEXT_LENGTH)}`),
  ].filter(Boolean);

  return sections.join('\n\n');
}

function formatFallbackMenuLine(item) {
  const highlights = [
    item.is_best_seller ? 'bán chạy' : null,
    item.ar_models?.glb_url || item.ar_models?.usdz_url ? 'có AR' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return `${item.name} (${formatCurrency(item.price)} VND${highlights ? `, ${highlights}` : ''})`;
}

function buildFallbackReply({ intent, menuItems = [], articles = [], failedToolNames = [] }) {
  const { restaurant, booking, ar, payments } = CHAT_KNOWLEDGE_BASE;
  const topMenuLines = menuItems.slice(0, 3).map(formatFallbackMenuLine);
  const topArticleTitles = articles.slice(0, 2).map((article) => article.title);
  const menuUnavailable = failedToolNames.includes('menu_search');
  const articleUnavailable = failedToolNames.includes('article_search');
  const tableUnavailable = failedToolNames.includes('table_availability');
  const siteUnavailable = failedToolNames.includes('site_content_search');

  switch (intent) {
    case 'table_availability':
      if (tableUnavailable) {
        return `Mình chưa đọc được trạng thái bàn hiện tại từ hệ thống quản lý, nên chưa thể xác nhận còn bàn trống hay không. Bạn nên liên hệ ${restaurant.hotline.join(' / ')} để nhân viên kiểm tra trực tiếp giúp bạn.`;
      }
      return `${booking.summary} Nếu bạn cần kiểm tra bàn trống theo thời gian thực, mình sẽ ưu tiên đọc trạng thái từ hệ thống bàn của nhà hàng và điều hướng bạn sang trang liên hệ để giữ chỗ.`;
    case 'menu_recommendation':
      if (menuUnavailable && topMenuLines.length === 0) {
        return 'Mình chưa tải được dữ liệu thực đơn lúc này, nên chưa thể gợi ý món chính xác. Bạn thử lại sau ít phút hoặc mở trang thực đơn để xem trực tiếp nhé.';
      }
      if (topMenuLines.length > 0) {
        return `Mình gợi ý nhanh từ thực đơn hiện có: ${topMenuLines.join('; ')}. Bạn có thể mở thẻ món để xem chi tiết và AR.`;
      }
      return 'Mình chưa tìm được món thật sát yêu cầu, bạn thử nói thêm về ngân sách, số người hoặc món bạn muốn ăn nhé.';
    case 'ar_support': {
      if (menuUnavailable && topMenuLines.length === 0) {
        return `${ar.summary} Hiện mình chưa tải được danh sách món có AR để gợi ý cụ thể. Bạn vẫn có thể vào trang AR và thử lại sau ít phút.`;
      }
      const arMenu = menuItems
        .filter((item) => item.ar_models?.glb_url || item.ar_models?.usdz_url)
        .slice(0, 3)
        .map((item) => item.name);

      const arHint = arMenu.length > 0 ? ` Một số món đang có AR: ${arMenu.join(', ')}.` : '';
      return `${ar.summary} iPhone/iPad dùng Quick Look, Android dùng Scene Viewer hoặc WebXR.${arHint} Nếu chưa mở được, hãy kiểm tra quyền camera và Wifi ${restaurant.guestWifi}.`;
    }
    case 'booking_support':
    case 'booking_followup':
      return `${booking.summary} ${booking.dineIn} Nếu cần nhanh, bạn có thể liên hệ ${restaurant.hotline.join(' / ')}.`;
    case 'contact_info':
      return `Sakura phục vụ ${restaurant.hours}, bếp nhận order cuối lúc ${restaurant.lastKitchenOrder}. Hotline: ${restaurant.hotline.join(' / ')}. Email hỗ trợ: ${restaurant.emails.support}.`;
    case 'payment_support':
      return `${payments.summary} Hiện nhà hàng hỗ trợ ${payments.methods.join(' và ')}. ${payments.refund}`;
    case 'order_support':
      return `${booking.dineIn} Với mang về hoặc giao hàng: ${booking.takeaway}`;
    case 'content_discovery':
      if (articleUnavailable && topArticleTitles.length === 0) {
        return 'Mình chưa tải được dữ liệu bài viết lúc này, nên chưa thể gợi ý nội dung chính xác. Bạn có thể mở trang blog để xem các bài mới nhất.';
      }
      if (topArticleTitles.length > 0) {
        return `Mình thấy vài nội dung phù hợp trên blog: ${topArticleTitles.join('; ')}. Bạn có thể mở từng thẻ để đọc nhanh.`;
      }
      return 'Khu vực blog hiện chưa có bài viết thật sát câu hỏi này, bạn có thể vào trang blog để xem các nội dung mới nhất.';
    case 'site_info':
      if (siteUnavailable) {
        return 'Mình chưa tải được dữ liệu nội dung website lúc này, nên chưa thể trích đúng thông tin từ các trang public. Bạn có thể mở các mục Giới thiệu, Liên hệ hoặc Blog để xem trực tiếp.';
      }
      return 'Mình có thể đọc thông tin từ các trang public như Giới thiệu, Liên hệ, Blog, Tuyển dụng, Chính sách và Điều khoản. Bạn cứ nói rõ mục bạn muốn xem, mình sẽ trích đúng phần liên quan.';
    default:
      if (topMenuLines.length > 0) {
        return `Mình có thể hỗ trợ về thực đơn, AR, đặt bàn và thanh toán. Gợi ý nhanh cho bạn: ${topMenuLines.join('; ')}.`;
      }
      return `Mình có thể hỗ trợ về thực đơn, AR, đặt bàn và thông tin nhà hàng. Sakura phục vụ ${restaurant.hours}; hotline hiện tại là ${restaurant.hotline.join(' / ')}.`;
  }
}

function getIntentActions(intent, cards = []) {
  const quickLinks = CHAT_KNOWLEDGE_BASE.quickLinks;

  switch (intent) {
    case 'table_availability':
      return [{ type: 'navigate', label: 'Liên hệ / đặt bàn', path: quickLinks.contact }];
    case 'menu_recommendation':
      return [
        { type: 'navigate', label: 'Xem thực đơn', path: quickLinks.home },
        { type: 'navigate', label: 'Mở AR', path: quickLinks.ar },
      ];
    case 'ar_support':
      return [{ type: 'navigate', label: 'Trải nghiệm AR', path: quickLinks.ar }];
    case 'content_discovery':
      return [{ type: 'navigate', label: 'Xem blog', path: quickLinks.blog }];
    case 'site_info':
      return [];
    case 'contact_info':
    case 'booking_support':
    case 'booking_followup':
      return [{ type: 'navigate', label: 'Liên hệ / đặt bàn', path: quickLinks.contact }];
    case 'payment_support':
      return [{ type: 'navigate', label: 'Mở giỏ hàng', path: quickLinks.cart }];
    case 'order_support':
      return [
        { type: 'navigate', label: 'Đặt món ngay', path: quickLinks.cart },
        { type: 'navigate', label: 'Lịch sử đơn', path: quickLinks.orderHistory },
      ];
    default:
      return cards.length > 0
        ? [{ type: 'navigate', label: 'Xem thực đơn', path: quickLinks.home }]
        : [{ type: 'navigate', label: 'Liên hệ nhà hàng', path: quickLinks.contact }];
  }
}

function buildConversationSummary({ previousSummary = '', message, intent, menuItems = [], articles = [], usedFallback = false }) {
  const entries = String(previousSummary || '')
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(-Math.max(MAX_SUMMARY_ENTRIES - 1, 0));

  const highlights = [];
  if (menuItems.length > 0) highlights.push(`gợi ý món ${menuItems.slice(0, 2).map((item) => item.name).join(', ')}`);
  if (articles.length > 0) highlights.push(`nhắc bài ${articles.slice(0, 2).map((article) => article.title).join(', ')}`);
  if (usedFallback) highlights.push('đã dùng trả lời dự phòng');

  entries.push(
    clipText(
      `- intent ${intent}; khách hỏi "${message}"; ${highlights.length > 0 ? highlights.join('; ') : 'chưa có dữ liệu phụ trợ nổi bật'}`,
      140,
    ),
  );

  return entries.slice(-MAX_SUMMARY_ENTRIES).join('\n');
}

export async function generateChatReply({ message, conversationId, currentPath = '', io }) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  const session = ensureConversation(conversationId);
  const history = getConversationHistory(session.conversationId).slice(-MAX_HISTORY_MESSAGES);
  const conversationSummary = getConversationSummary(session.conversationId);
  const conversationMetadata = getConversationMetadata(session.conversationId);
  const bookingDraft = conversationMetadata?.bookingDraft || null;
  const intent = detectIntent(message, history, conversationSummary);
  const availableTools = buildAiToolDefinitions();
  let plannerResult = {
    model: 'gpt-4o-mini',
    selectedTools: [],
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      requestCount: 0,
    },
  };

  try {
    plannerResult = await planAIToolCalls({
      message,
      intent,
      currentPath,
      conversationHistory: history,
      conversationSummary,
      tools: availableTools,
    });
  } catch (error) {
    console.warn('[chat] Planner failed, using fallback tool selection', {
      code: error?.code,
      message: error?.message,
    });
  }

  const selectedTools =
    plannerResult.selectedTools?.length > 0
      ? plannerResult.selectedTools
      : buildFallbackToolSelection({ intent, message, currentPath });

  if (['booking_support', 'booking_followup'].includes(intent) && !selectedTools.some((tool) => tool.name === 'reservation_booking')) {
    selectedTools.unshift({
      id: 'forced_reservation_booking',
      name: 'reservation_booking',
      arguments: { query: message },
    });
  }

  const { results: toolResults, failedToolNames } = await runSelectedTools({
    selectedTools,
    intent,
    message,
    history,
    conversationSummary,
    currentPath,
    io,
    conversationId: session.conversationId,
    bookingDraft,
  });

  const context = buildContextSections({
    intent,
    currentPath,
    toolResults,
  });

  const recommendedItems = toolResults.flatMap((result) => result.items || []);
  const relatedArticles = toolResults.flatMap((result) => result.articles || []);
  const cards = toolResults.flatMap((result) => result.cards || []).slice(0, 4);
  const replyOverride = toolResults.find((result) => result.replyOverride)?.replyOverride || '';
  const suggestionsOverride = toolResults.find((result) => Array.isArray(result.suggestionsOverride) && result.suggestionsOverride.length > 0)?.suggestionsOverride || [];
  const hasSiteContentActions = toolResults.some(
    (result) => result.name === 'site_content_search' && Array.isArray(result.actions) && result.actions.length > 0,
  );
  const actions = uniqueActions([
    ...toolResults.flatMap((result) => result.actions || []),
    ...(intent === 'general' && hasSiteContentActions ? [] : getIntentActions(intent, cards)),
  ]);

  let reply = '';
  let suggestions = [];
  let usedFallback = false;
  let status = 'success';
  let model = plannerResult.model || 'gpt-4o-mini';
  let aiUsage = mergeUsageTotals(plannerResult.usage);
  const shouldSkipAI =
    (failedToolNames.includes('menu_search') && recommendedItems.length === 0 && ['menu_recommendation', 'ar_support', 'general'].includes(intent)) ||
    (failedToolNames.includes('article_search') && relatedArticles.length === 0 && ['content_discovery', 'general'].includes(intent)) ||
    (failedToolNames.includes('table_availability') && ['table_availability'].includes(intent)) ||
    (failedToolNames.includes('site_content_search') && ['site_info'].includes(intent));

  try {
    if (replyOverride) {
      reply = replyOverride;
      suggestions = suggestionsOverride;
      model = 'tool-response';
    } else if (shouldSkipAI) {
      throw Object.assign(new Error('Critical internal tool data unavailable'), { code: 'CHAT_CONTEXT_UNAVAILABLE' });
    } else {
      const aiResponse = await chatWithAI({
        message,
        intent,
        context,
        conversationHistory: history,
        conversationSummary,
        currentPath,
        toolNames: selectedTools.map((tool) => tool.name),
      });
      model = aiResponse.model || model;
      aiUsage = mergeUsageTotals(aiUsage, aiResponse.usage);
      reply = aiResponse.reply;
      suggestions = Array.isArray(aiResponse.suggestions) ? aiResponse.suggestions : [];
    }
  } catch (error) {
    usedFallback = true;
    status = error?.code === 'AI_PROVIDER_UNAVAILABLE' ? 'error' : 'fallback';
    console.warn('[chat] Falling back to deterministic reply', {
      intent,
      code: error?.code,
      cause: error?.cause?.message,
    });
    reply = buildFallbackReply({
      intent,
      menuItems: recommendedItems,
      articles: relatedArticles,
      failedToolNames,
    });
    suggestions = [];
  }

  appendConversationMessage(session.conversationId, { role: 'user', content: message });
  appendConversationMessage(session.conversationId, { role: 'assistant', content: reply });

  updateConversationSummary(
    session.conversationId,
    buildConversationSummary({
      previousSummary: conversationSummary,
      message,
      intent,
      menuItems: recommendedItems,
      articles: relatedArticles,
      usedFallback,
    }),
  );

  try {
    await recordAiMonitoringEvent({
      conversationId: session.conversationId,
      requestId,
      provider: 'openai',
      model,
      intent,
      message,
      currentPath,
      selectedTools: selectedTools.map((tool) => tool.name),
      failedToolNames,
      llmRequestCount: aiUsage.requestCount,
      toolCallCount: selectedTools.length,
      promptTokens: aiUsage.promptTokens,
      completionTokens: aiUsage.completionTokens,
      totalTokens: aiUsage.totalTokens,
      estimatedCostUsd: estimateUsageCost({
        model,
        promptTokens: aiUsage.promptTokens,
        completionTokens: aiUsage.completionTokens,
      }),
      latencyMs: Date.now() - startedAt,
      usedFallback,
      status,
      replyPreview: reply,
    });
  } catch (error) {
    console.warn('[chat] Failed to record AI monitoring event', {
      message: error?.message,
    });
  }

  return {
    conversationId: session.conversationId,
    intent,
    reply,
    suggestions,
    actions,
    cards,
    meta: {
      usedFallback,
      failedToolNames,
      selectedTools: selectedTools.map((tool) => tool.name),
      usage: aiUsage,
    },
  };
}
