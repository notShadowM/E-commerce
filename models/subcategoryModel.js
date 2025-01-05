const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Subcategory name is required"],
      unique: [true, "Subcategory name must be unique"],
      minlength: [2, "Subcategory name is too short"],
      maxlength: [32, "Subcategory name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Subcategory must belong to a category"],
    },
  },
  { timestamps: true }
);

const SubcategoryModel = mongoose.model("Subcategory", subcategorySchema);

module.exports = SubcategoryModel;
