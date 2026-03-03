import fs from "fs";
import csv from "csv-parser";

console.log(process.cwd())

fs.createReadStream("./insurance_claims3_test.csv")
  .pipe(csv())
  .on("headers", headers => {
    console.log(headers);  
  });
