export async function GET() {
  return Response.json({ status: "ok", service: "multikids", time: new Date().toISOString() });
}
