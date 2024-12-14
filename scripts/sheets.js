import gauth from "../scripts/gauth.js";
import { constants, managers_map } from "../constants.js";
import logger from "../logs/logger.js";

import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { process_write_json } from "./process-json.js";

const { sheets } = gauth();

const {
  CARSSPREADSHEET,
  MONITORSPREADSHEET,
  monitorsheetname,
  come_status,
  google_web_app_url,
  sheetnames,
  sourcevalue,
  managers_obj_path
} = constants;

/**
 * Асинхронная функция get_data для получения данных из Google Sheets по идентификатору таблицы и диапазону.
 * @param {string} spreadsheetId - Идентификатор таблицы Google Sheets.
 * @param {string} range - Диапазон данных для получения.
 * @returns {Array} - Массив значений данных из таблицы.
 */
const get_data = async (spreadsheetId, range) => {
  try {
    const {
      data: { values },
    } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return values;
  } catch (error) {
    logger.error(error.message);
  }
};

/**
 * Returns the column number containing the specified value on the given sheet.
 * @param {Sheet} sheet - The sheet on which the search is performed.
 * @param {string} value - The value to find.
 * @returns {number} - The column number where the value is found. If the value is not found, -1 is returned.
 */
function getColumnNumberByValue(values, value) {
  if (values) {
    const columnNumber = values.indexOf(value) + 1;
    return columnNumber;
  } else {
    return -1; // Returns -1 if the value is not found
  }
}

/**
 * Asynchronous function get_data to retrieve data from Google Sheets by spreadsheet ID and range.
 * @param {string} spreadsheetId - The ID of the Google Sheets spreadsheet.
 * @param {Array} ranges - The ranges  array of data to retrieve.
 * @returns {Array} - An array of data values from the spreadsheet.
 */
const get_all_data = async () => {
  const spreadsheetId = CARSSPREADSHEET;
  const ranges = sheetnames.split(", ");

  try {
    const {
      data: { valueRanges },
    } = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges, // Add multiple ranges you want to retrieve data from
    });

    const obj = valueRanges.reduce((acc, { values, range }, i) => {
      if (i === 2) {
        const col_i = getColumnNumberByValue(values[0], sourcevalue);
        acc[range.replace(/!.*/g, "")] = values
          .map((r) => r[col_i - 1])
          .filter(Boolean)
          .slice(1);
      } else {
        acc[range.replace(/!.*/g, "")] = values;
      }
      return acc;
    }, {});

    return obj;
  } catch (error) {
    logger.error(`Error in get_data: ${error.message}`);
  }
};

/**
 * Асинхронная функция save для сохранения данных в таблице Google Sheets и выполнения дополнительных действий.
 * @param {Object} params - Параметры для сохранения в таблице.
 * @returns {Object|boolean} - Объект успешного сохранения или логическое значение false в случае ошибки.
 */
const save = async (params) => {
  const timestamp = format(new Date(), "dd.MM.yyyy");
  const uid = uuidv4();

  try {
    let {
      date,
      time,
      manager,
      brand,
      model,
      gosnum,
      name,
      phone,
      source,
      visit,
      chat_id,
      avito,
      manager_name
    } = params;

    if (manager_name) {
      source = "Авито";
    } else {
      manager_name = managers_map.managers[manager].m;
    }

    const values = await get_data(MONITORSPREADSHEET, monitorsheetname);
    const arr = [
      uid,
      date,
      time,
      ,
      ,
      ,
      managers_map.managers[manager].m,
      brand,
      model,
      gosnum,
      ,
      ,
      ,
      ,
      ,
      come_status,
      name,
      phone,
      source,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      timestamp,
      visit,
    ];

    const requestBody = { values: [arr] };
    const row = values.length + 1;
    const range = `${monitorsheetname}!A${row}`;

    const { data } = await sheets.spreadsheets.values.update({
      spreadsheetId: MONITORSPREADSHEET,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody,
    });

    if (data.spreadsheetId) {
      logger.info("User data saved successfully");
    }

    const response = await fetch(google_web_app_url, {
      method: "POST",
      body: JSON.stringify({
        name,
        phone,
        date,
        gosnum,
        brand,
        model,
        chat_id,
        row,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return { success: "success" };
    } else {
      logger.warn(
        "Error getting the link:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    logger.error(error.message);
    return false;
  }
};

export { save, get_all_data };
