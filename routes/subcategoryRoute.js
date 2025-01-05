const express = require("express");
const {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
  setCategoryIdToBody,
  createFilterObjectSubCategory,
} = require("../services/subcategoryService");
const {
  createSubcategoryValidator,
  getSubcategoryValidator,
  updateSubcategoryValidator,
  deleteSubcategoryValidator,
  nestedGetSubcategoryValidator,
} = require("../utils/validators/subcategoryValidator");
const { protect, allowTo } = require("../services/authService");

// note mergeParams: Allows us to access params from other routes
// for example we need to access categoryId from the category route
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    protect,
    allowTo("admin", "manager"),
    setCategoryIdToBody,
    createSubcategoryValidator,
    createSubcategory
  )
  .get(
    nestedGetSubcategoryValidator,
    createFilterObjectSubCategory,
    getSubcategories
  );

router
  .route("/:id")
  .get(getSubcategoryValidator, getSubcategory)
  .put(
    protect,
    allowTo("admin", "manager"),
    updateSubcategoryValidator,
    updateSubcategory
  )
  .delete(
    protect,
    allowTo("admin"),
    deleteSubcategoryValidator,
    deleteSubcategory
  );

module.exports = router;
