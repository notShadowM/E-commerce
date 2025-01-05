const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

// !todo: important!! there is no cascade delete and he didn't apply it, I need to apply it and it is possible on the mongoose schema, and if it is not possible I need to apply making another query to delete the related documents
// note another note: is cacahe needed here? Maybe depending on the app design. I will do some research about it

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`Document not found with id of ${id}`, 404));
    }

    res.status(204).json();
  });

// todo: search for using the body inside the query? ig it is not a good practice, maybe adding a middleware to check for the needed fields and they pass it to another property in the req object, and then use it in the query. I can apply all this in the validation middleware
exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`Document not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({ data: newDocument });
  });

// !we can add the populate by adding a second pramaeter and using chaining on query
exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findById(req.params.id);
    if (!document) {
      return next(
        new ApiError(`Document not found with id of ${req.params.id}`, 404)
      );
    }
    res.status(200).json({ data: document });
  });

// todo: for all other routes get list of itmes maybe they don't need pagination or any other feature, but it all depends on the project requirements, or on the schema itself if it can use the same features
exports.getAll = (Model, modelName) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) filter = req.filterObj;

    // todo: we can move it inside the apiFeatures class? is it worth it?
    const numberOfDocuments = await Model.countDocuments();
    // !build query
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .pagination({ numberOfDocuments })
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // !excute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
