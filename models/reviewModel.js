const mongoose = require("mongoose");
const Product = require("./productModel");
// note: based on your business requirements, for example if the market research predict that the active users will be low and the reviews will be low, you can embed the reviews in the product document, but if the reviews will be high, it's better to create a separate collection for the reviews and reference the product in the review document.
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Review title cannot exceed 100 characters"],
    },
    ratings: {
      type: Number,
      required: [true, "Review must have a rating"],
      min: [1, "Rating must be at least 1.0"],
      max: [5, "Rating must not exceed 5.0"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    // !parent referencing (one to many)
    // note: it is used when the children are expected to be too much
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  // todo: add image as well
  this.populate({ path: "user", select: "name" });
  next();
});

// todo: can't we just multply the avgRatings by the old ratingsQuantity and add the new rating to the sum of the ratings and then divide by the new ratingsQuantity? isn't that more efficient? sure we will use the product id to get the old ratingsQuantity and avgRatings but we will not need to do the aggregation pipeline, but is it more efficient?
// todo: maybe for update it will be a bit not applicable? if we can't get the old ratingsQuantity and avgRatings, but for create it could work fine
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    // stage 1: match the reviews that belong to the product
    {
      $match: { product: productId },
    },
    // stage 2: calculate the average rating and the number of reviews
    {
      $group: {
        _id: "$product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: result[0].ratingsQuantity,
      ratingsAverage: result[0].avgRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post("findOneAndUpdate", async (doc) => {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
  }
});

reviewSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
