export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!result.success) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: result.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  req.body = result.data.body ?? req.body;
  next();
};
