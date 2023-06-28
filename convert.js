import fs from "fs";

import converter from "json-2-csv";

const convertToCSV = async (JSONData) => {
    try {
        const parsedData = JSON.parse(JSONData);

        const csv = await converter.json2csvAsync(parsedData, {
            unwindArrays: true,
        });

        // print CSV string
        // console.log(csv);

        // write CSV to a file
        fs.writeFileSync("./products.csv", csv);

        console.log("converted to csv");
    } catch (err) {
        console.log(err);
    }
};

const start = async () => {
    const agencies = fs.readFileSync("./agencies.json");
    await convertToCSV(agencies);
};

start();
