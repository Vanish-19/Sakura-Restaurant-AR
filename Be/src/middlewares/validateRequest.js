/**
 * Middleware xác thực Data theo định dạng của Zod.
 * Tách biệt hoàn toàn phần bắt lỗi payload bẩn để Controller không cần check lại.
 */
export const validateParams = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.params !== undefined) Object.assign(req.params, parsed.params);
    if (parsed.query !== undefined) {
      for (const key of Object.keys(req.query || {})) delete req.query[key];
      Object.assign(req.query, parsed.query);
    }
    next();
  } catch (error) {
    const details = error.issues || error.errors || [];
    return res.status(400).json({
      success: false,
      error: 'Data validation failed',
      message: details[0]?.message || 'Data validation failed',
      details,
    });
  }
};
