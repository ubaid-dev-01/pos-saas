/** Extract store id from /super-admin/stores/:storeId (React Router splat routes omit useParams). */
export function parseStoreIdFromPath(pathname = "") {
  const match = String(pathname).match(/\/super-admin\/stores\/([^/]+)/);
  return match?.[1] || null;
}
