import axios from "axios";
import cheerio from "cheerio";
import converter from "json-2-csv";
import fs from "fs";

const convertToCSV = async (JSONData) => {
    try {
        const csv = await converter.json2csvAsync(JSONData, {
            unwindArrays: true,
        });

        fs.writeFileSync("./output/motac/agencies.csv", csv);

        console.log("converted to csv");
    } catch (err) {
        console.log(err);
    }
};

const max = 2824;
const url = `https://motac.gov.my/en/check/tobtab?c=i&n=&v=0`;

const getNextText = (element) => {
    if (!element.nodeName) {
        element = element[0];
    }
    if (!element) return "";
    const next = element.nextSibling;
    return next?.nodeType === 3 ? next.nodeValue.trim() : "";
};

let agencies = [];

async function scrapeData(number) {
    try {
        const { data } = await axios.get(
            `https://motac.gov.my/en/check/tobtab?c=i&n=&v=${number}`
        );
        const $ = cheerio.load(data);
        const listItems = $("tbody tr");
        listItems.each((idx, el) => {
            const info = $(el).children().next();
            const name = $(info).children("strong").text();
            const phone = getNextText($(info).children(".uk-icon-phone-square"));
            agencies.push({
                name,
                phone,
            });
        });
        console.dir(agencies);
    } catch (err) {
        console.error(err);
    }
}

const start = async () => {
    const perPage = 20;
    const maxPage = Math.ceil(max / perPage);

    for (let i = 1; i <= maxPage; i++) {
        const number = i * perPage;

        await scrapeData(number);
    }

    fs.writeFile(
        "./output/motac/agencies.json",
        JSON.stringify(agencies, null, 2),
        (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Successfully written data to file");
        }
    );

    await convertToCSV(agencies);
};
start();
