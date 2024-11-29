import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let managers_map;

const constants = {
  ...Object.keys(process.env).reduce((acc, key) => {
    acc[key] = process.env[key];
    return acc;
  }, {}),
  HOME: `${__dirname}/index.html`,
  come_status: "Ждем клиента",
  obj_path: `${__dirname}/json/hash_obj.json`,
  managers_obj_path: `${__dirname}/json/managers.json`
};

fs.readFile(`${__dirname}/json/managers.json`, "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const jsonData = JSON.parse(data);
  managers_map = jsonData;
});

export { constants, __dirname, managers_map };
