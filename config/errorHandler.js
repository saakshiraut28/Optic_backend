/**
 * Uniform error response for all Tapestry API failures.
 * Passes through the exact status code and message from Tapestry.
 *
 * @format
 */

function tapestryError(res, error) {
  const status = error?.response?.status ?? 500;
  const message = error?.response?.data ?? { message: error.message };
  return res.status(status).json({ success: false, error: message });
}

module.exports = { tapestryError };
