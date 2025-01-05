class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    // todo: add documentaion in postman and for any other endpoint
    const { page, sort, limit, fields, keyword, ...queryStringObj } =
      this.queryString;
    // url?price[gte] = 10 => { price: { gte: 10 } } => { price: { "$gte": 10 } }
    // Replace operators (gte, gt, lte, lt) with MongoDB operators ($gte, $gt, $lte, $lt)
    let queryStr = JSON.stringify(queryStringObj || {});
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  // todo: in sort and limitFields we can add default by destructing the sort and fields from the queryString
  sort() {
    // note: by adding "-" to the sort it will make decending order :)
    if (this.queryString.sort) {
      // price,sold => price sold
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      // name,price => name price "this will return only name and price"
      // note: by default _id is always returned if you want to exclude it you have to add -_id
      // -name,-price => "this will return all fields except name and price"
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      // todo: shouldn't we exclude __v by default? maybe in dev mode we can show it but in production we should hide it? in all models not just this one
      // note: i did try to add "-__v" upove but it didn't work because you can't include and disclude at the same time except for _id ig, there is a better way to do it in general
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      const query = {};
      // todo: i think instead of passing the modelName we can pass the fields that we want to search in, and then we can loop through them and add them to the query, but is it worth it?
      // note the $options: "i" is for case insensitivity
      if (modelName === "product") {
        query.$or = [
          { title: { $regex: this.queryString.keyword, $options: "i" } },
          { description: { $regex: this.queryString.keyword, $options: "i" } },
        ];
      } else {
        query.$or = [
          { name: { $regex: this.queryString.keyword, $options: "i" } },
        ];
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  // todo: i think i can add a function async here to get the number of documents and then pass it to the pagination function but it will be called outside the class, still it is inside the class
  pagination(data = {}) {
    const { defaultLimit = 50, defaultPage = 1, numberOfDocuments } = data;
    const page = +this.queryString.page || defaultPage;
    const limit = +this.queryString.limit || defaultLimit;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    if (numberOfDocuments && skip >= numberOfDocuments) {
      throw new Error("This page does not exist");
    }
    // pagination results
    // note: all this is not needed depending on your business requirements, but in general they are good for almost all use cases
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.totalPages = Math.ceil(numberOfDocuments / limit) || undefined;

    if (endIndex < numberOfDocuments) {
      pagination.next = page + 1;
    }

    if (skip > 0) {
      pagination.previous = page - 1;
    }

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination;
    return this;
  }
}

module.exports = ApiFeatures;
