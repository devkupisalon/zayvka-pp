import express from 'express';
import path from 'path';

import logger from './logs/logger.js';
import { constants, __dirname } from './constants.js';
import { save, get_cars, get_values } from './scripts/sheets.js';

const { HOME, bot_token } = constants;
const app = express();

const stylesPath = path.join(__dirname, 'styles');
const codePath = path.join(__dirname, 'code');

/** STYLES */
app.get('/styles/:path', (req, res) => res.sendFile(path.join(stylesPath, req.params.path)));

/** SCRIOTS */
app.get('/scripts/:path', (req, res) => res.sendFile(path.join(codePath, req.params.path)));

/** HOPE PAGE */
app.get('/', (req, res) => res.sendFile(HOME));

/** ERRORS */
app.use((error, req, res, next) => {
    logger.error(`An error occurred: ${error.message}`);
    res.status(500).send(error);
});

/** Get cars brands and models for select */
app.get('/get-cars', async (rea, res) => {
    try {
        const data = await get_cars();

        return res.json({ data });
    } catch (error) {
        logger.error(`An error occurred in get_cars: ${error.message}`);
        return res.status(500).json({ error: error.toString() });
    }
});

/** Get gropus values for select */
app.get('/getdata', async (req, res) => {
    try {
        const values = await get_values();

        return res.json(values);
    } catch (error) {
        logger.error(`An error occurred in get_data: ${error.message}`);
        return res.status(500).json({ error: error.toString() });
    }
});

/** Save user data to spreadsheet */
app.get('/savedata', async (req, res) => {
    try {
        
        logger.info(`Data successfully received from mini-app`);
        const success = await save(req.query);

        return res.json({ success });
    } catch (error) {
        logger.error(`An error occurred in save_data: ${error.message}`);
        return res.status(500).json({ error: error.toString() });
    }
});

/** server init */
app.listen('8000', (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info('Server is running on port 8000');
});