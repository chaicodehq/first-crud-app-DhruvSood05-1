/**
 * TODO: Handle 404 errors
 *
 * Return 404: { error: { message: "Route not found" } }
 */
export function notFound(req, res) {
  // Your code here
  return res.status(400).json({ error: { message: "Route not found" } });
}
