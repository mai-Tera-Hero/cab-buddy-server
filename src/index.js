require("dotenv").config();

const app = require('./core/app');
const startup = require('./core/startup'); // <-- load startup tasks like DB

const PORT = process.env.PORT || 3000;

(async () => {
  await startup(); // connect DB, future telegram, cron jobs
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();
