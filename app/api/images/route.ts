// app/api/admin/images/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { isStaffUser } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    if (!(await isStaffUser())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [images, videos] = await Promise.all([
      cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        max_results: 500,
      }),
      cloudinary.api.resources({
        type: "upload",
        resource_type: "video",
        max_results: 500,
      }),
    ]);

    // merge both
    const resources = [...images.resources, ...videos.resources];

    return NextResponse.json({ images: resources });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// app/api/admin/images/route.ts
export async function DELETE(req: Request) {
  try {
    if (!(await isStaffUser())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { publicId } = await req.json();

    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
