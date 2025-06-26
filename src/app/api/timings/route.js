import clientPromise from "../../../../lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("NimazDb");
    const timings = await db.collection("timings").find({}).toArray();

    return new Response(JSON.stringify(timings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Database Error", details: err }),
      {
        status: 500,
      }
    );
  }
}
