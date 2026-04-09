/**
 * Middleware xác thực Data theo định dạng của Zod.
 * Tách biệt hoàn toàn phần bắt lỗi payload bẩn để Controller không cần check lại.
 */
export const validateParams = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Data validation failed',
      details: error.errors
    });
  }
};
