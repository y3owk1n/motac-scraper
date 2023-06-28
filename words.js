import axios from "axios";
import fs from "fs";

async function loadWordApi() {
  try {
    const { data } = await axios.get(
      `https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json`
    );
    return data;
  } catch (err) {
    console.error(err);
  }
}

const start = async () => {
  const data = await loadWordApi();

  const entries = Object.entries(data);

  const reshapedEntries = entries.map(([key]) => ({
    text: key,
    length: key.length,
  }));

  fs.writeFile(
    "./output/words.json",
    JSON.stringify(reshapedEntries, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Successfully written data to file");
    }
  );
};
start();
