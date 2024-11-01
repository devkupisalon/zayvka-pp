import gauth from '../scripts/gauth.js';
import { constants, managers_map } from '../constants.js';
import logger from '../logs/logger.js';

import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';


const { sheets } = gauth();

const {
    for_pass_sheetname,
    carssheetname,
    CARSSPREADSHEET,
    MONITORSPREADSHEET,
    monitorsheetname,
    come_status,
    google_web_app_url } = constants;

/**
 * Асинхронная функция get_data для получения данных из Google Sheets по идентификатору таблицы и диапазону.
 * @param {string} spreadsheetId - Идентификатор таблицы Google Sheets.
 * @param {string} range - Диапазон данных для получения.
 * @returns {Array} - Массив значений данных из таблицы.
 */
const get_data = async (spreadsheetId, range) => {
    try {
        const { data: { values } } = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        return values;
    } catch (error) {
        logger.error(error.message);
    }
}

/**
 * Асинхронная функция get_values для получения значений из таблицы по заранее определенным параметрам.
 * @returns {Array} - Массив значений из таблицы.
 */
const get_values = async () => {
    try {
        const values = await get_data(CARSSPREADSHEET, for_pass_sheetname);

        logger.info('Data received successfully');
        return values;
    } catch (error) {
        logger.error(error.message);
    }
}

/**
 * Асинхронная функция save для сохранения данных в таблице Google Sheets и выполнения дополнительных действий.
 * @param {Object} params - Параметры для сохранения в таблице.
 * @returns {Object|boolean} - Объект успешного сохранения или логическое значение false в случае ошибки.
 */
const save = async (params) => {

    const timestamp = format(new Date(), 'dd.MM.yyyy');
    const uid = uuidv4();

    try {
        const { date, time, manager, brand, model, gosnum, name, phone, source, visit, chat_id } = params;
        const values = await get_data(MONITORSPREADSHEET, monitorsheetname);
        const arr = [uid, date, time, , , , managers_map[manager].m, brand, model, gosnum, , , , , , come_status, name, phone, source, , , , , , , , , , , , , , , , , , , timestamp, visit];

        const requestBody = { values: [arr] };
        const row = values.length + 1;
        const range = `${ monitorsheetname }!A${ row }`;

        const { data } = await sheets.spreadsheets.values.update({
            spreadsheetId: MONITORSPREADSHEET,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody,
        });

        if (data.spreadsheetId) {
            logger.info('User data saved successfully');
        }

        const response = await fetch(google_web_app_url, {
            method: 'POST',
            body: JSON.stringify({ name, phone, date, gosnum, brand, model, chat_id, row }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return { success: 'success' };
        } else {
            logger.warn('Error getting the link:', response.status, response.statusText);
        }
    } catch (error) {
        logger.error(error.message);
        return false;
    }

}

/**
 * Асинхронная функция get_cars для получения данных о машинах из таблицы Google Sheets.
 * @returns {Array} - Массив значений данных о машинах из таблицы.
 */
const get_cars = async () => {
    try {
        const values = await get_data(CARSSPREADSHEET, carssheetname);
        logger.info('Data received successfully');
        return values;
    } catch (error) {
        logger.error(error.message);
    }
}

export { get_values, save, get_cars };