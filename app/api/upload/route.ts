// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Check if it's single file or multiple files
    const singleFile = formData.get("file") as File;
    const multipleFiles = formData.getAll("files") as File[];
    
    let filesToUpload: File[] = [];
    
    if (multipleFiles.length > 0 && multipleFiles[0] instanceof File) {
      // Multiple files upload
      filesToUpload = multipleFiles.filter(file => file instanceof File);
    } else if (singleFile instanceof File) {
      // Single file upload
      filesToUpload = [singleFile];
    } else {
      return NextResponse.json({ error: "No valid files received" }, { status: 400 });
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json({ error: "No files to upload" }, { status: 400 });
    }

    // Old image URL for cleanup (single file case)
    const oldImageUrl = formData.get("oldImageUrl") as string;

    // Upload all files to Cloudinary
    const uploadResults = await Promise.all(
      filesToUpload.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "uploads",
          resource_type: "auto"
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          originalFilename: file.name,
          size: file.size
        };
      })
    );

    // Cleanup old image if provided (for single file updates)
    if (oldImageUrl && oldImageUrl.includes("cloudinary.com")) {
      try {
        const publicId = oldImageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up old image:", cleanupError);
        // Don't fail the upload if cleanup fails
      }
    }

    // Return response based on upload type
    if (filesToUpload.length === 1) {
      // Single file - return { url } for backward compatibility
      return NextResponse.json({ 
        url: uploadResults[0].url 
      });
    } else {
      // Multiple files - return { uploads: [...] }
      return NextResponse.json({ 
        uploads: uploadResults 
      });
    }

  } catch (error) {
    console.error("Error uploading image(s):", error);
    return NextResponse.json(
      { error: "Failed to upload image(s)" },
      { status: 500 }
    );
  }
}

// DELETE endpoint (same as before)
export async function DELETE(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || !imageUrl.includes("cloudinary.com")) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    // Extract public ID from Cloudinary URL
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    
    if (!publicId) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}