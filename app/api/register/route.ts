import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { writeClient } from "@/sanity/lib/write-client";
import { CHECK_FOR_EXISTING_USER, CHECK_FOR_ID_QUERY } from "@/sanity/lib/query";
import fs from "fs";
import path from "path";
import { client } from "@/sanity/lib/client";

export async function POST(req: NextRequest) {
  try {
    const { name, surname, email, phone, address, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Preveri ali uporabnik že obstaja
    const existingUser = await writeClient.fetch(CHECK_FOR_EXISTING_USER, { email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const filePath = path.join(process.cwd(), "public", "defaultProfileImg.png");
    const buffer = fs.readFileSync(filePath);

    const imageAsset = await writeClient.assets.upload(
      "image",
      buffer,
      {filename: "defaultProfileImg.png"}
    )
    /*
    let generatedId;
    let existingId;
    do {
      //make ID from date, in miliseconds
      generatedId = Date.now();

      existingId = await client.fetch(CHECK_FOR_ID_QUERY, {generatedId})
      //console.log(existingId)
    } while (existingId);
*/
 const newUser = await writeClient.create({
  _type: "users",
  name,
  surname,
  email,
  phone,
  address,
  password: hashedPassword,
  role: "user",
  image: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: imageAsset._id,
    }
  }
});

//console.log("Incoming data:", { name, email, password });

    return NextResponse.json(
      { message: "User created successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
      
    );
  }
}
