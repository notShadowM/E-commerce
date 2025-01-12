// todo: when working with db don't forget any change need to drop the collection
const mongoose = require("mongoose");

const dbConnection = () => {
  // todo: is removing createdAt a good idea?
  mongoose.set("toJSON", {
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret.createdAt;

      return ret;
    },
  });

  mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`Database Connected: ${conn.connection.host}`);
  });
};

module.exports = dbConnection;
