import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
    come_status: 'Ждем клиента'
};

// Чтение JSON-файла
fs.readFile('managers.json', 'utf8', (err, data) => {
  if (err) {
      console.error(err);
      return;
  }
  const jsonData = JSON.parse(data);
  managers_map = jsonData;
});

// const managers_map = {
//     '8fb4889c-3f58-4cec-a11f-9bd446049914':
//     {
//       m: 'Алексей',
//       link: 'https://t.me/kupisalon_zayvka_bot/start?startapp=8fb4889c-3f58-4cec-a11f-9bd446049914'
//     },
//     '9ab266c0-867a-4017-980e-76460fd47630':
//     {
//       m: 'Ирина',
//       link: 'https://t.me/kupisalon_zayvka_bot/start?startapp=9ab266c0-867a-4017-980e-76460fd47630'
//     },
//     '6e9f227b-3054-465e-a81c-ee660aa0a90a':
//     {
//       m: 'Николоз',
//       link: 'https://t.me/kupisalon_zayvka_bot/start?startapp=6e9f227b-3054-465e-a81c-ee660aa0a90a'
//     },
//     'c27c32f5-34de-48ea-a711-cbf8da0c080c':
//     {
//       m: 'Дмитрий',
//       link: 'https://t.me/kupisalon_zayvka_bot/start?startapp=c27c32f5-34de-48ea-a711-cbf8da0c080c'
//     },
//     '482634aa-1137-478b-a749-4f49fb884d77':
//     {
//       m: 'Андрей',
//       link: 'https://t.me/kupisalon_zayvka_bot/start?startapp=482634aa-1137-478b-a749-4f49fb884d77'
//     }
//   };

export { constants, __dirname, managers_map };