import OpenAI from 'openai';

let openai = null;

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const MAX_REPLY_LENGTH = 520;
const MAX_SUGGESTION_LABEL_LENGTH = 72;
const MAX_SUGGESTION_LENGTH = 90;

function getOpenAIClient() {
  if (openai) return openai;

  if (!process.env.OPENAI_API_KEY) {
    const configError = new Error('OPENAI_API_KEY is not configured');
    configError.code = 'AI_PROVIDER_UNAVAILABLE';
    throw configError;
  }

  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

function sanitizeReply(value = '') {
  const text = String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) {
    return 'Mình chưa thể phản hồi lúc này, bạn thử hỏi lại giúp mình nhé.';
  }

  return text.length > MAX_REPLY_LENGTH ? `${text.slice(0, MAX_REPLY_LENGTH - 3).trim()}...` : text;
}

function sanitizeSuggestionItem(value, userMessage = '') {
  const normalizedUserMessage = String(userMessage || '').trim().toLowerCase();
  const rawLabel =
    typeof value === 'string'
      ? value
      : value && typeof value === 'object'
        ? String(value.label || value.title || value.prompt || '').trim()
        : '';
  const rawPrompt =
    value && typeof value === 'object'
      ? String(value.prompt || '').trim()
      : typeof value === 'string'
        ? String(value).trim()
        : '';

  const label = rawLabel.replace(/\s+/g, ' ').trim();
  const prompt = rawPrompt.replace(/\s+/g, ' ').trim();

  if (!label || label.length < 4) return null;
  if (!prompt || prompt.length < 6) return null;
  if (prompt.toLowerCase() === normalizedUserMessage) return null;

  return {
    label:
      label.length > MAX_SUGGESTION_LABEL_LENGTH
        ? `${label.slice(0, MAX_SUGGESTION_LABEL_LENGTH - 3).trim()}...`
        : label,
    prompt:
      prompt.length > MAX_SUGGESTION_LENGTH
        ? `${prompt.slice(0, MAX_SUGGESTION_LENGTH - 3).trim()}...`
        : prompt,
  };
}

function sanitizeSuggestions(values = [], userMessage = '') {
  const seenPrompts = new Set();

  return values
    .map((value) => sanitizeSuggestionItem(value, userMessage))
    .filter(Boolean)
    .filter((value) => {
      const key = value.prompt.toLowerCase();
      if (seenPrompts.has(key)) return false;
      seenPrompts.add(key);
      return true;
    })
    .slice(0, 4);
}

function parseStructuredResponse(rawContent = '', userMessage = '') {
  const trimmed = String(rawContent || '').trim();
  if (!trimmed) {
    return {
      reply: 'Mình chưa thể phản hồi lúc này, bạn thử hỏi lại giúp mình nhé.',
      suggestions: [],
    };
  }

  const normalized = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBraceIndex = normalized.indexOf('{');
  const lastBraceIndex = normalized.lastIndexOf('}');
  const jsonCandidate =
    firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex
      ? normalized.slice(firstBraceIndex, lastBraceIndex + 1)
      : normalized;

  try {
    const parsed = JSON.parse(jsonCandidate);
    const reply = sanitizeReply(parsed?.reply || parsed?.message || '');

    return {
      reply,
      suggestions: sanitizeSuggestions(parsed?.suggestions, userMessage),
    };
  } catch {
    return {
      reply: sanitizeReply(trimmed),
      suggestions: [],
    };
  }
}

function parseToolArguments(rawArguments = '{}') {
  try {
    const parsed = JSON.parse(String(rawArguments || '{}'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function mapHistoryMessages(conversationHistory = []) {
  return conversationHistory
    .filter((entry) => entry?.content && (entry.role === 'user' || entry.role === 'assistant'))
    .slice(-4)
    .map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));
}

function accumulateUsage(total, usage = {}) {
  return {
    promptTokens: Number(total.promptTokens || 0) + Number(usage?.prompt_tokens || 0),
    completionTokens: Number(total.completionTokens || 0) + Number(usage?.completion_tokens || 0),
    totalTokens: Number(total.totalTokens || 0) + Number(usage?.total_tokens || 0),
    requestCount: Number(total.requestCount || 0) + Number(usage?.request_count || 1),
  };
}

function buildToolPlannerSystemPrompt() {
  return `
<system_role>
Bạn là Sakura Assistant Planner, bộ điều phối công cụ cho chatbot của Sakura Restaurant.
Nhiệm vụ của bạn là chọn đúng công cụ nội bộ trước khi tạo câu trả lời cuối cùng cho khách.
</system_role>

<instructions>
- MUST ưu tiên gọi công cụ phù hợp cho các câu hỏi trong phạm vi nhà hàng.
- MUST chọn công cụ dựa trên câu hỏi hiện tại, lịch sử hội thoại ngắn và current_page.
- ALWAYS dùng tool về bàn khi khách hỏi bàn trống, sức chứa hoặc đặt bàn.
- ALWAYS dùng tool về menu khi khách hỏi món ăn, giá, nguyên liệu, AR của món.
- ALWAYS dùng tool về site content khi khách hỏi policy, privacy, terms, about, contact, career, press kit hoặc nội dung các trang public.
- ALWAYS dùng tool về article khi khách hỏi blog, tin tức, khuyến mãi, bài viết.
- ALWAYS dùng tool restaurant_info khi cần giờ mở cửa, hotline, địa chỉ, thanh toán, AR support hoặc thông tin vận hành chung.
- NEVER tạo câu trả lời cuối cùng ở bước này.
- Nếu câu hỏi ngoài phạm vi nhà hàng, bạn có thể không gọi tool.
</instructions>
`.trim();
}

function buildAnswerSystemPrompt() {
  return `
<system_role>
Bạn là Sakura Assistant, nhân viên CSKH số của Sakura Restaurant.
Thân thiện, rõ ràng, chuyên nghiệp, ngắn gọn. Bạn chỉ hỗ trợ thông tin public và vận hành nhà hàng.
</system_role>

<instructions>
<core_directives>
- ALWAYS chỉ dùng dữ liệu đã xác thực bên trong thẻ <context>.
- ALWAYS trả lời bằng tiếng Việt tự nhiên, súc tích, dễ hành động.
- MUST nói rõ "Dữ liệu hiện tại chưa đủ để xác nhận chính xác." nếu context không đủ hoặc thiếu dữ liệu quan trọng.
- NEVER bịa tên món, giá món, trạng thái bàn, khuyến mãi, chính sách hoặc thông tin pháp lý không có trong context.
- NEVER trả lời vượt phạm vi sang code, chính trị, pháp luật, thể thao, tài chính cá nhân.
- IF người dùng hỏi ngoài phạm vi, từ chối ngắn gọn và điều hướng về hỗ trợ nhà hàng.
</core_directives>

<constraints>
- Nếu không có tool nào được xác thực ở turn hiện tại, hãy trả lời rất thận trọng và nói dữ liệu chưa đủ khi cần.
- Không dùng markdown phức tạp.
- Không trả thêm khóa ngoài output contract.
</constraints>
</instructions>

<output_contract>
- Final output MUST là JSON object duy nhất.
- Schema bắt buộc: {"reply":"string","suggestions":[{"label":"string","prompt":"string"}]}.
- reply: tối đa khoảng 100-200 từ.
- suggestions: 0 đến 4 item.
- label: ngắn, phù hợp để hiển thị trên nút.
- prompt: cùng ý với label nhưng viết theo giọng người dùng, ví dụ "Giúp tôi..." hoặc "Tôi muốn...".
- Không trả thêm text ngoài JSON.
</output_contract>
`.trim();
}

export async function planAIToolCalls({
  message,
  intent = 'general',
  currentPath = '',
  conversationHistory = [],
  conversationSummary = '',
  tools = [],
}) {
  try {
    const client = getOpenAIClient();
    const historyMessages = mapHistoryMessages(conversationHistory);
    const plannerPayload = `
<context>
<intent>${intent}</intent>
<current_page>${currentPath || 'không rõ'}</current_page>
${conversationSummary ? `<conversation_summary>${conversationSummary}</conversation_summary>` : ''}
</context>

<user_input>
${message}
</user_input>
`.trim();

    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0,
      max_tokens: 220,
      tool_choice: tools.length > 0 ? 'auto' : 'none',
      tools: tools.map((tool) => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      })),
      messages: [
        { role: 'system', content: buildToolPlannerSystemPrompt() },
        ...historyMessages,
        { role: 'user', content: plannerPayload },
      ],
    });

    const toolCalls = response.choices[0]?.message?.tool_calls || [];

    return {
      model: CHAT_MODEL,
      selectedTools: toolCalls.map((call) => ({
        id: call.id,
        name: call.function?.name || '',
        arguments: parseToolArguments(call.function?.arguments || '{}'),
      })),
      usage: {
        promptTokens: Number(response.usage?.prompt_tokens || 0),
        completionTokens: Number(response.usage?.completion_tokens || 0),
        totalTokens: Number(response.usage?.total_tokens || 0),
        requestCount: 1,
      },
    };
  } catch (error) {
    console.error('Lỗi khi planner gọi OpenAI API:', error);
    const providerError = new Error('AI provider is unavailable');
    providerError.code = error?.code || 'AI_PROVIDER_UNAVAILABLE';
    providerError.cause = error;
    throw providerError;
  }
}

export async function chatWithAI({
  message,
  intent = 'general',
  context = '',
  conversationHistory = [],
  conversationSummary = '',
  currentPath = '',
  toolNames = [],
}) {
  try {
    const client = getOpenAIClient();
    const historyMessages = mapHistoryMessages(conversationHistory);
    const requestPayload = `
<context>
<intent>${intent}</intent>
<current_page>${currentPath || 'không rõ'}</current_page>
${toolNames.length > 0 ? `<verified_sources>${toolNames.join(', ')}</verified_sources>` : '<verified_sources>không rõ</verified_sources>'}
${conversationSummary ? `<conversation_summary>${conversationSummary}</conversation_summary>` : ''}
<verified_data>
${context || 'Chưa có thêm dữ liệu xác thực ngoài câu hỏi hiện tại.'}
</verified_data>
</context>

<user_input>
${message}
</user_input>
`.trim();

    const response = await client.chat.completions.create({
      model: CHAT_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: 'system', content: buildAnswerSystemPrompt() },
        ...historyMessages,
        { role: 'user', content: requestPayload },
      ],
    });

    return {
      model: CHAT_MODEL,
      ...parseStructuredResponse(response.choices[0]?.message?.content, message),
      usage: {
        promptTokens: Number(response.usage?.prompt_tokens || 0),
        completionTokens: Number(response.usage?.completion_tokens || 0),
        totalTokens: Number(response.usage?.total_tokens || 0),
        requestCount: 1,
      },
    };
  } catch (error) {
    console.error('Lỗi khi gọi OpenAI API:', error);
    const providerError = new Error('AI provider is unavailable');
    providerError.code = error?.code || 'AI_PROVIDER_UNAVAILABLE';
    providerError.cause = error;
    throw providerError;
  }
}

export function mergeUsageTotals(...usageEntries) {
  return usageEntries.reduce(
    (accumulator, entry) => accumulateUsage(accumulator, {
      prompt_tokens: entry?.promptTokens || 0,
      completion_tokens: entry?.completionTokens || 0,
      total_tokens: entry?.totalTokens || 0,
      request_count: entry?.requestCount || 0,
    }),
    {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      requestCount: 0,
    },
  );
}
