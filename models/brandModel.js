const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Brand name is required"],
      unique: [true, "Brand name must be unique"],
      minlength: [3, "Brand name is too short"],
      maxlength: [32, "Brand name is too long"],
    },
    slug: {
      type: String,
      lowercase: true,
      select: false,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/brands/${doc.image}`;
  }
};

// !for update process, select all or one
brandSchema.post("init", setImageURL);

// !for create process
brandSchema.post("save", setImageURL);

const BrandModel = mongoose.model("Brand", brandSchema);

module.exports = BrandModel;
