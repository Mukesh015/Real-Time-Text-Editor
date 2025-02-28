import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Docs from "@/model/docs";

export async function POST(req) {
  try {
    await connectToDatabase();

    const { name, content, userId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newDoc = await Docs.create({
      name,
      content,
      collaborators: [{ userId, cursorPosition: 0 }],
    });

    return NextResponse.json({ success: true, data: newDoc }, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find all documents where the user is in the collaborators array
    const userDocs = await Docs.find({ "collaborators.userId": userId }).sort({
      updatedAt: -1,
    });
    console.log("userDocs :>> ", userDocs);
    return NextResponse.json(
      { success: true, data: userDocs },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
