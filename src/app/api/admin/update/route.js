// import { NextResponse } from "next/server";
// import clientPromise from "../../../../../lib/db"; // adjust path if needed

// export async function POST(req) {
//   try {
//     const body = await req.json();

//     const client = await clientPromise;
//     const db = client.db("NimazDb");

//     const result = await db.collection("timings").updateOne(
//       {},
//       { $set: body },
//       { upsert: true } 
//     );

//     if (result.modifiedCount > 0 || result.upsertedCount > 0) {
//       return NextResponse.json({ success: true });
//     } else {
//       return NextResponse.json({
//         success: false,
//         message: "No document updated or inserted",
//       });
//     }
//   } catch (error) {
//     console.error("Update Error:", error);
//     return NextResponse.json({ success: false, error: error.message });
//   }
// }







import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    // Import and connect only when needed
    const { default: clientPromise } = await import("../../../../../lib/db");
    const client = await clientPromise;
    const db = client.db("NimazDb");

    const result = await db
      .collection("timings")
      .updateOne({}, { $set: body }, { upsert: true });

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({
        success: false,
        message: "No document updated or inserted",
      });
    }
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}