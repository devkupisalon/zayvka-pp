import express from "express";
import path from "path";

import logger from "./logs/logger.js";
import { constants, __dirname } from "./constants.js";
import { save, get_all_data } from "./scripts/sheets.js";

const { HOME } = constants;
const app = express();

const stylesPath = path.join(__dirname, "styles");
const codePath = path.join(__dirname, "code");

/** WEB-APP ROUTES */
const routes = [
  { path: "/styles/:path", file: stylesPath, req: true },
  { path: "/scripts/:path", file: codePath, req: true },
  { path: "/", file: HOME },
];

/** PROCESS WEB-APP */
routes.forEach((route) => {
  app.get(route.path, (req, res) =>
    res.sendFile(
      route.req ? path.join(route.file, req.params.path) : route.file
    )
  );
});

/** ERRORS */
app.use((error, req, res, next) => {
  logger.error(`An error occurred: ${error.message}`);
  res.status(500).send(error);
});

/** get ALL data */
app.get("/get-all-data", async (req, res) => {
  try {
    const data = await get_all_data();

    return res.json({ data });
  } catch (error) {
    logger.error(`An error occurred in get_cars: ${error.message}`);
    return res.status(500).json({ error: error.toString() });
  }
});

/** Save user data to spreadsheet */
app.get("/savedata", async (req, res) => {
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
app.listen("8000", (err) => {
  if (err) {
    logger.error(err.message);
  }
  logger.info("Server is running on port 8000");
});
