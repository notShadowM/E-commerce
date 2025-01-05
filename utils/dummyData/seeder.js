const fs = require("fs");
// eslint-disable-next-line import/no-extraneous-dependencies
require("dotenv").config({ path: "config.env" });
const Product = require("../../models/productModel");
const dbConnection = require("../../config/database");

// Connect to the database
dbConnection();

// Read JSON files
const products = JSON.parse(
  fs.readFileSync(`${__dirname}/products.json`, "utf-8")
);

// insert data into db
const insertData = async () => {
  try {
    await Product.create(products);
    console.log("Data successfully imported");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
  }
};

// Delete data from db
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data successfully destroyed");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
  }
};

if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
