/**
 * Standardized API Response Helpers
 */

export const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = 'An error occurred', error = null, statusCode = 500) => {
  const response = {
    success: false,
    message
  };

  if (error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, items = [], pagination = {}, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      total: pagination.total || items.length,
      totalPages: pagination.totalPages || 1
    }
  });
};
