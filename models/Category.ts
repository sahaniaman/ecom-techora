import { model, models, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["ACTIVE", "INACTIVE"], 
      default: "ACTIVE" 
    },
  },
  { timestamps: true },
);

const Category = models.Category || model("Category", categorySchema);

export default Category;
