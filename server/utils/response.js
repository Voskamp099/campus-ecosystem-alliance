/**
 * 统一 API 响应格式工具
 * 所有 API 响应都应通过此模块生成，确保格式一致
 */

/**
 * 成功响应
 * @param {Object} res - Express response 对象
 * @param {Object} options - 响应选项
 * @param {*} options.data - 响应数据
 * @param {string} [options.message] - 成功消息
 * @param {number} [options.code] - HTTP 状态码（默认 200）
 * @param {Object} [options.meta] - 元数据（分页等）
 */
export function success(res, { data, message, code = 200, meta } = {}) {
  const response = {
    success: true
  };

  if (message) {
    response.message = message;
  }

  if (data !== undefined) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(code).json(response);
}

/**
 * 错误响应
 * @param {Object} res - Express response 对象
 * @param {Object} options - 响应选项
 * @param {string} options.message - 错误消息
 * @param {number} [options.code] - HTTP 状态码（默认 400）
 * @param {Object} [options.errors] - 详细错误信息（表单验证等）
 * @param {string} [options.errorCode] - 业务错误码
 */
export function error(res, { message, code = 400, errors, errorCode } = {}) {
  const response = {
    success: false,
    message: message || "操作失败"
  };

  if (errors) {
    response.errors = errors;
  }

  if (errorCode) {
    response.errorCode = errorCode;
  }

  return res.status(code).json(response);
}

/**
 * 列表响应（带分页）
 * @param {Object} res - Express response 对象
 * @param {Object} options - 响应选项
 * @param {Array} options.items - 列表数据
 * @param {number} options.total - 总条数
 * @param {number} options.page - 当前页码
 * @param {number} options.pageSize - 每页条数
 * @param {string} [options.message] - 成功消息
 */
export function list(res, { items, total, page, pageSize, message } = {}) {
  return success(res, {
    data: items,
    message,
    meta: {
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  });
}

/**
 * 单条数据响应
 * @param {Object} res - Express response 对象
 * @param {Object} options - 响应选项
 * @param {*} options.item - 数据对象
 * @param {string} [options.message] - 成功消息
 * @param {number} [options.code] - HTTP 状态码（默认 200）
 */
export function item(res, { item, message, code = 200 } = {}) {
  return success(res, { data: item, message, code });
}

/**
 * 创建成功响应
 * @param {Object} res - Express response 对象
 * @param {Object} options - 响应选项
 * @param {*} options.item - 创建的数据对象
 * @param {string} [options.message] - 成功消息
 */
export function created(res, { item, message = "创建成功" } = {}) {
  return success(res, { data: item, message, code: 201 });
}

/**
 * 更新成功响应
 * @param {Object} res - Express response 对象
 * @param {Object} options - 响应选项
 * @param {*} options.item - 更新的数据对象
 * @param {string} [options.message] - 成功消息
 */
export function updated(res, { item, message = "更新成功" } = {}) {
  return success(res, { data: item, message });
}

/**
 * 删除成功响应
 * @param {Object} res - Express response 对象
 * @param {string} [message] - 成功消息
 */
export function deleted(res, message = "删除成功") {
  return success(res, { message, code: 204 });
}

/**
 * 常用错误快捷方法
 */
export const errors = {
  badRequest: (res, message = "请求参数错误") => error(res, { message, code: 400 }),
  unauthorized: (res, message = "未授权，请先登录") => error(res, { message, code: 401 }),
  forbidden: (res, message = "无权限访问") => error(res, { message, code: 403 }),
  notFound: (res, message = "资源不存在") => error(res, { message, code: 404 }),
  conflict: (res, message = "资源冲突") => error(res, { message, code: 409 }),
  validation: (res, errors, message = "数据验证失败") => error(res, { message, code: 422, errors }),
  serverError: (res, message = "服务器内部错误") => error(res, { message, code: 500 }),
  serviceUnavailable: (res, message = "服务暂不可用") => error(res, { message, code: 503 })
};

/**
 * Express 错误处理中间件包装器
 * 统一处理 service 层抛出的错误
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
