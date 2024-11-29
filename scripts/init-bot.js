import TelegramBot from "node-telegram-bot-api";
import { constants, managers_map } from "../constants.js";
import { save } from "./sheets.js";
import {
  deletePropertiesFromFile,
  append_json_file,
  process_return_json,
  process_write_json
} from "./process-json.js";

const { bot_token, obj_path, managers_obj_path } = constants;
const bot = new TelegramBot(bot_token, { polling: true });

async function updateMessage(callbackQuery, chat_id) {
  await bot.editMessageReplyMarkup(
    { inline_keyboard: [] },
    { chat_id, message_id: callbackQuery.message.message_id }
  );
}

/**
 * Sends a confirmation message to the manager with inline keyboard options to activate or reject a request.
 * @param {Object} data - Data containing manager, brand, model, gosnum, name, and phone.
 */
async function sendConfirmMessage(data) {
  let { manager, brand, model, gosnum, name, phone, chat_id, date, avito, source } = data;
  let managerId;

  if (avito === "true") {
    source = "Авито";
    const managerKeys = Object.keys(managers_map.managers);
    const index = managers_map.index;
    const currentIndex = index % managerKeys.length;
    const currentKey = managerKeys[currentIndex];
    managerId = managers_map.managers[currentKey].telegram_id;
    managers_map.index = (index + 1) % managerKeys.length;
    data.manager_name = managers_map.managers[currentKey].m;
    await process_write_json(managers_obj_path, managers_map);
  } else {
    managerId = managers_map.managers[manager].telegram_id;
  }

  const message_text = `Входящая заявка на пропуск:\nИмя - ${name}\nТелефон- ${phone}\nМарка - ${brand}\nМодель - ${model}\nГосномер - ${gosnum}\nДата - ${date}\nИсточник - ${source}`;
  const to_user_text = `${name}, ваша заявка ожидает подтверждения`;
  const hash = new Date().toISOString();
  const x = { [hash]: data };

  await append_json_file(obj_path, x);

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Активировать",
            callback_data: JSON.stringify({
              action: "activate",
              data: hash,
            }),
          },
          {
            text: "Отклонить",
            callback_data: JSON.stringify({
              action: "reject",
              data: hash,
            }),
          },
        ],
      ],
    },
  };

  bot.sendMessage(managerId, message_text, options);
  bot.sendMessage(chat_id, to_user_text);

  return { success: "success" };
}

// Event listener for callback queries
bot.on("callback_query", async (callbackQuery) => {
  const { username, id } = callbackQuery.from;
  const { action, data } = JSON.parse(callbackQuery.data);
  const json_data = await process_return_json(obj_path);
  const { brand, model, gosnum, name, chat_id, date } = json_data[data];

  if (action === "activate") {
    const { success } = await save(json_data[data]);

    if (success) {
      const message_text = `${name}, пропуск для Вас заказан на ${date} для автомобиля ${brand} ${model}, госномер ${gosnum}. Ссылка для навигатора - https://yandex.ru/maps/-/CCQdrLAg-D`;
      bot.sendMessage(chat_id, message_text, { disable_web_page_preview: true, });
      bot.sendMessage(id, "Заявка на пропуск успешно создана и отправлена клиенту");
    }
  } else if (action === "reject") {
    bot.sendMessage(chat_id, `Ваша заявка отклонена.\nОбратитесь к менеджеру @${username} для дополнительной информации.`);
    bot.sendMessage(id, "Информация передана клиенту");
  }
  await updateMessage(callbackQuery, id);
  deletePropertiesFromFile(data);
});

export { sendConfirmMessage };
