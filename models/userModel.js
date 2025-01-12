const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      select: false, // todo: what is the purpose of this field?
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      // todo: ig in the signup we should make it required and unique
      // unique: true,
    },
    profileImg: String,
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    passwordChangedAt: Date,
    // todo: these 3 fields are for password reset, move them when working on redis, also search what is the best pracice is 3 fields required?
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    // !child referencing (one to many)
    // note: it is used when the children are expected to be not much
    wishlist: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
      ],
      select: false,
    },
    // todo: should we put one of the fields uniqe "like the alias most probably" to make sure there won't be 2 address with the same data? and surely we will add validation afterwards :)
    addresses: {
      type: [
        {
          alias: String,
          details: String,
          phone: String,
          city: String,
          postalCode: String,
        },
      ],
      select: false,
    },
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.profileImg) {
    doc.profileImg = `${process.env.BASE_URL}/users/${doc.profileImg}`;
  }
};

// todo: make it work for update process and create process? is it worth it?
userSchema.pre("save", async function (next) {
  // !this line won't work because this is only going to work for create process i guess
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// !for update process, select all or one
userSchema.post("init", setImageURL);

// !for create process
userSchema.post("save", setImageURL);

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordChangedAt;
  delete user.passwordResetCode;
  delete user.passwordResetExpires;
  delete user.passwordResetVerified;
  delete user.slug;
  delete user.active;
  delete user.createdAt;
  delete user.updatedAt;

  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
