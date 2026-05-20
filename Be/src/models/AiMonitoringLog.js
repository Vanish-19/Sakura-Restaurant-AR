import mongoose from 'mongoose';

const aiMonitoringLogSchema = new mongoose.Schema(
  {
    conversationId: { type: String, index: true, trim: true },
    requestId: { type: String, trim: true },
    provider: { type: String, default: 'openai', trim: true },
    model: { type: String, default: 'gpt-4o-mini', trim: true },
    intent: { type: String, default: 'general', trim: true, index: true },
    questionGroup: { type: String, default: 'Khác', trim: true, index: true },
    userMessage: { type: String, default: '', trim: true },
    currentPath: { type: String, default: '', trim: true },
    selectedTools: [{ type: String, trim: true }],
    failedToolNames: [{ type: String, trim: true }],
    llmRequestCount: { type: Number, default: 0, min: 0 },
    toolCallCount: { type: Number, default: 0, min: 0 },
    promptTokens: { type: Number, default: 0, min: 0 },
    completionTokens: { type: Number, default: 0, min: 0 },
    totalTokens: { type: Number, default: 0, min: 0 },
    estimatedCostUsd: { type: Number, default: 0, min: 0 },
    latencyMs: { type: Number, default: 0, min: 0 },
    usedFallback: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['success', 'fallback', 'error'],
      default: 'success',
      index: true,
    },
    replyPreview: { type: String, default: '', trim: true },
  },
  {
    timestamps: true,
    collection: 'ai_monitoring_logs',
  },
);

aiMonitoringLogSchema.index({ createdAt: -1, provider: 1 });
aiMonitoringLogSchema.index({ questionGroup: 1, createdAt: -1 });

export default mongoose.model('AiMonitoringLog', aiMonitoringLogSchema);
