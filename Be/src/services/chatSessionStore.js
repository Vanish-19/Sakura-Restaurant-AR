import crypto from 'node:crypto';

const SESSION_TTL_MS = 45 * 60 * 1000;
const MAX_MESSAGES_PER_CONVERSATION = 8;
const MAX_SUMMARY_LENGTH = 420;
const conversationStore = new Map();

function sanitizeSummary(summary = '') {
  return String(summary || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SUMMARY_LENGTH);
}

function pruneExpiredConversations() {
  const now = Date.now();

  for (const [conversationId, session] of conversationStore.entries()) {
    if (now - session.updatedAt > SESSION_TTL_MS) {
      conversationStore.delete(conversationId);
    }
  }
}

function createSession(conversationId) {
  const now = Date.now();

  return {
    conversationId,
    messages: [],
    summary: '',
    metadata: {
      bookingDraft: null,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function ensureConversation(conversationId) {
  pruneExpiredConversations();

  const normalizedId =
    typeof conversationId === 'string' && conversationId.trim()
      ? conversationId.trim()
      : crypto.randomUUID();

  if (!conversationStore.has(normalizedId)) {
    conversationStore.set(normalizedId, createSession(normalizedId));
  }

  const session = conversationStore.get(normalizedId);
  session.updatedAt = Date.now();
  return session;
}

export function getConversationHistory(conversationId) {
  return ensureConversation(conversationId).messages;
}

export function getConversationSummary(conversationId) {
  return ensureConversation(conversationId).summary || '';
}

export function updateConversationSummary(conversationId, summary) {
  const session = ensureConversation(conversationId);
  session.summary = sanitizeSummary(summary);
  session.updatedAt = Date.now();
  return session.summary;
}

export function getConversationMetadata(conversationId) {
  return ensureConversation(conversationId).metadata || {};
}

export function updateConversationMetadata(conversationId, metadata = {}) {
  const session = ensureConversation(conversationId);
  session.metadata = {
    ...(session.metadata || {}),
    ...(metadata || {}),
  };
  session.updatedAt = Date.now();
  return session.metadata;
}

export function appendConversationMessage(conversationId, message) {
  const session = ensureConversation(conversationId);

  session.messages.push({
    role: message.role,
    content: message.content,
    createdAt: Date.now(),
  });

  if (session.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    session.messages = session.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
  }

  session.updatedAt = Date.now();
  return session.messages;
}
