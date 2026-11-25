export function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
  const body = {
    success: true,
    message,
    data
  };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendError(res, { statusCode = 500, message = 'Internal server error', errors = null, code = null } = {}) {
  const body = {
    success: false,
    message
  };
  if (code) body.code = code;
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

export function buildPaginationMeta({ page, limit, totalItems }) {
  return {
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit))
    }
  };
}
