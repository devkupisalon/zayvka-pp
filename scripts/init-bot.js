import TelegramBot from "node-telegram-bot-api";
import { constants, managers_map } from "../constants.js";
import { save } from "./sheets.js";
import {logger} from "../logs/logger.js";

const { bot_token } = constants;
const bot = new TelegramBot(bot_token, { polling: true });

/**
 * Sends a confirmation message to the manager with inline keyboard options to activate or reject a request.
 * @param {Object} data - Data containing manager, brand, model, gosnum, name, and phone.
 */
function sendConfirmMessage(data) {
  const { manager, brand, model, gosnum, name, phone, chat_id } = data;
  const managerId = managers_map[manager].telegram_id;
  const message_text = `Входящая заявка на пропуск:\nИмя - ${name}\nТелефон- ${phone}\nМарка - ${brand}\nМодель - ${model}\nГосномер - ${gosnum}\n`;
  const to_user_text = `${name}, ваша заявка ожидает подтверждения`;
  
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Активировать",
            callback_data: JSON.stringify({
              action: "activate",
              data,
            }),
          },
          {
            text: "Отклонить",
            callback_data: JSON.stringify({
              action: "reject",
              data,
            }),
          },
        ],
      ],
    },
  };

  logger.info(options);

  bot.sendMessage(managerId, message_text, options);
  bot.sendMessage(chat_id, to_user_text);
  return { success: "success" };
}

// Event listener for callback queries
bot.on("callback_query", async (callbackQuery) => {
  const { username, id } = callbackQuery.from;
  const { action, data } = JSON.parse(callbackQuery.data);
  const { brand, model, gosnum, name, chat_id, date } = data;

  if (action === "activate") {
    const { success } = await save(data);

    if (success) {
      const message_text = `${name}, пропуск для Вас заказан на ${date} для автомобиля ${brand} ${model}, госномер ${gosnum}. Ссылка для навигатора - https://yandex.ru/maps/-/CCQdrLAg-D`;
      bot.sendMessage(chat_id, message_text, {
        disable_web_page_preview: true,
      });
      bot.sendMessage(
        id,
        "Заявка на пропуск успешно создана и отправлена клиенту"
      );
    }
  } else if (action === "reject") {
    bot.sendMessage(
      chat_id,
      `Ваша заявка отклонена.\nОбратитесь к менеджеру @${username} для дополнительной информации.`
    );
    bot.sendMessage(id, "Информация передана клиенту");
  }
});

export { sendConfirmMessage };
