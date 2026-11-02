export default function ok(data, meta) {
  if (meta == null) {
    return { data: data };
  }
  return { data: data, meta: meta };
}
