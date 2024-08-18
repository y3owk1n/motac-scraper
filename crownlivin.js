import axios from "axios";
import cheerio from "cheerio";
import converter from "json-2-csv";
import fs from "fs";

const convertToCSV = async (JSONData, path) => {
  try {
    const csv = await converter.json2csvAsync(JSONData, {
      unwindArrays: true,
    });

    fs.writeFileSync(path, csv);

    console.log("converted to csv");
  } catch (err) {
    console.log(err);
  }
};

async function getTableTopIds() {
  let tableTopIds = [];
  const { data } = await axios.get(`https://crownlivin.com.my/mix-match/`);
  const $ = cheerio.load(data);

  const listItems = $('[data-tab="tabletop"] li');
  listItems.each((idx, el) => {
    const id = $(el).attr("data-id");
    tableTopIds.push(id);
  });

  console.log(">>>>>>>>>>>>>>>>>>>>>> tableTopIds: ", tableTopIds);
  return tableTopIds;
}

async function getSizes() {
  let sizes = [];
  const { data } = await axios.get(`https://crownlivin.com.my/mix-match/`);
  const $ = cheerio.load(data);

  let jsonData = null;

  // Iterate over each script tag
  $("script").each((i, el) => {
    const scriptContent = $(el).html().trim();

    // Check if the script content contains paSizeTerms
    if (scriptContent.includes("var paSizeTerms")) {
      const jsonStringMatch = scriptContent.match(
        /var\s+paSizeTerms\s*=\s*JSON\.parse\('(.*)'\);/,
      );

      if (jsonStringMatch && jsonStringMatch[1]) {
        const jsonString = jsonStringMatch[1];

        // Parse the JSON string
        jsonData = JSON.parse(jsonString);
      }
    }
  });

  if (jsonData) {
    sizes = jsonData.map((d) => d.slug);
  } else {
    console.log("paSizeTerms JSON data not found.");
  }

  console.log(">>>>>>>>>>>>>>>>>>>>>> sizes: ", sizes);
  return sizes;
}

async function getLegIds() {
  let legIds = [];
  const { data } = await axios.get(`https://crownlivin.com.my/mix-match/`);
  const $ = cheerio.load(data);

  const listItems = $(".editor--leg--shape li");
  listItems.each((idx, el) => {
    const id = $(el).attr("data-id");
    legIds.push(id);
  });

  console.log(">>>>>>>>>>>>>>>>>>>>>> legIds: ", legIds);
  return legIds;
}

// getTableTopIds();

// getSizes();

// getLegIds();

// empty data = {"variation":{"price_html":""}}
// table top = https://crownlivin.com.my/wp-admin/admin-ajax.php?action=mm_get_variation&product_id=18161&size_slug=1-5m-x-0-9m&surface_slug=b11518
// leg =  https://crownlivin.com.my/wp-admin/admin-ajax.php?action=mm_get_variation&product_id=125022&size_slug=1-5m-x-0-9m
const start = async () => {
  let tt = [];
  let l = [];

  const apiBase =
    "https://crownlivin.com.my/wp-admin/admin-ajax.php?action=mm_get_variation";
  // table top ids
  // const ttids = await getTableTopIds();

  const ttids = [
    "18161",
    "18173",
    "18174",
    "18175",
    "126267",
    "18176",
    "23797",
    "23943",
    "24041",
    "125448",
    "18178",
    "18177",
  ];

  // sizes
  const slugs = await getSizes();

  // surfoces
  const surface = "b11518";

  // legs
  const legs = await getLegIds();

  for (const id of ttids) {
    for (const slug of slugs) {
      // await delay(random(3, 5));
      // console.log(">>>>>>>>>>>>> waiting...");
      const { data } = await axios.get(
        `${apiBase}&product_id=${id}&size_slug=${slug}&surface_slug=${surface}`,
      );

      if (data.variation.price_html !== "") {
        const parsedData = data.variation;

        const formattedData = {
          id: parsedData.id,
          name: parsedData.name,
          sku: parsedData.sku,
          price: parsedData.price,
          regular_price: parsedData.regular_price,
          sale_price: parsedData.sale_price,
        };

        tt.push(formattedData);
        console.log(">>>>>>>>>>>>> completed for ", parsedData.name);
      }
    }
  }

  for (const id of legs) {
    for (const slug of slugs) {
      const { data } = await axios.get(
        `${apiBase}&product_id=${id}&size_slug=${slug}`,
      );

      if (data.variation.price_html !== "") {
        const parsedData = data.variation;

        const formattedData = {
          id: parsedData.id,
          name: parsedData.name,
          sku: parsedData.sku,
          price: parsedData.price,
          regular_price: parsedData.regular_price,
          sale_price: parsedData.sale_price,
        };

        l.push(formattedData);
        console.log(">>>>>>>>>>>>> completed for ", parsedData.name);
      }
    }
  }

  const combined = [...tt, ...l];

  fs.writeFile(
    "./output/crownliving/data.json",
    JSON.stringify(combined, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
    },
  );

  await convertToCSV(combined, "./output/crownliving/data.csv");
};

start();
