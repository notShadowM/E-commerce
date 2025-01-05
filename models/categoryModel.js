const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Category name is required"],
      unique: [true, "Category name must be unique"],
      minlength: [3, "Category name is too short"],
      maxlength: [32, "Category name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
  }
};

// !for update process, select all or one
categorySchema.post("init", setImageURL);

// !for create process
categorySchema.post("save", setImageURL);

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
