const mongoose = require("mongoose");

// Config MongoDB
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => {
    // console.log("Error in Connetion to DB");
    console.log(err);
    process.exit(1); // if there's an error in connetion to db STOP all the process (app)
  });

async function main() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
