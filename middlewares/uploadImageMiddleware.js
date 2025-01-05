const multer = require("multer");
const ApiError = require("../utils/apiError");

const multerOptions = () => {
  // todo: try integrate third party service for image uploads (try cloudinary "https://cloudinary.com/home")? if not applicable try to save buffer on the db instead of saving it on the server, or make another db or collection for images and add a route to upload images and return their id "is this one good?" and afterwards just pass the id of the image to the correspond field
  // !disk storage
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: (req, file, cb) => {
  //     const ext = file.mimetype.split("/")[1];
  //     // cb(null, `category-${req.params.id}-${Date.now()}.${ext}`);
  //     cb(null, `category-${uuidv4()}-${Date.now()}.${ext}`);
  //   },
  // });

  // !memory storage
  const multerStorage = multer.memoryStorage();

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      return cb(null, true);
    }
    cb(new ApiError("Not an image! Please upload only images.", 400), false);
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMultipleImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
