const dbLoader = require("../loaders/database");

module.exports = async () => {
  await dbLoader(); // connect to MongoDB
};
