const tg = window.Telegram.WebApp;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const manager = tg?.initDataUnsafe.start_param || urlParams.get("manager");
const chat_id =
  tg && tg.initDataUnsafe && tg.initDataUnsafe.user
    ? tg.initDataUnsafe.user.id
    : false;

const fields = {
  name: "#manager-name",
  phone: "#manager-phone",
  date: "#date",
  time: "#time",
  brand: "#car-brands-select",
  model: "#car-models-select",
  gosnum: "#car-number",
  source: "#source-select",
};

const colors = {
  bg: "#e7e7e7",
  bg_two: "#27262c",
  text: "#27262c",
  button_bg: "#7886cb",
  button_text: "#e7e7e7",
  body_bg: "#18231d",
};

const setCheckmark = (s) => {
  s.style.pointerEvents = "none";
  s.style.opacity = "0.5";
};

const fill_tg = document.querySelector(".fill-tg");
const fill_text = document.getElementById("fill-text");
const n = document.getElementById("manager-name");
const ph = document.getElementById("manager-phone");
const container = document.querySelector(".container");
const preloader = document.querySelector(".c-car-spinner");
const send = document.querySelector(".send");
const form = document.querySelector("#partner-form");
const bottomSheet = document.querySelector(".bottomsheet");
const carBrandsSelect = document.getElementById("car-brands-select");
const carModelsSelect = document.getElementById("car-models-select");
const selectElement = document.getElementById("field_select-type");
const sourceElement = document.getElementById("source-select");

function showBottomBar(text) {
  document.querySelector(".bottom-sheet").style.display = "block";
  $(".bottom-sheet-wrapper").addClass("show-modal");

  // Извлечение ссылки из текста
  const { textBeforeLink, url } = extractLink(text);

  const link = document.createElement("a");
  const textNode = document.createTextNode(textBeforeLink);

  link.href = url || "#"; // Если ссылка не найдена, используем решетку
  link.textContent = url || ""; // Устанавливаем текст ссылки
  link.style.color = colors.button_bg; // Цвет ссылки

  const bottomText = document.getElementById("bottom-text");
  bottomText.textContent = ""; // Очистить содержимое элемента
  bottomText.appendChild(textNode); // Добавляем текст
  bottomText.appendChild(link); // Добавляем ссылку
}

function extractLink(text) {
  const textRegex = /.*[^(https?:\/\/)?(www\.)?\S+\.\S+]/gm;
  const urlRegex = /(https?:\/\/.+)/gm;

  const urlMatch = text.match(urlRegex);
  const textMatch = text.match(textRegex);

  if (urlMatch && textMatch) {
    const url = urlMatch[0];
    const textBeforeLink = textMatch[0];
    return { textBeforeLink, url };
  } else {
    return { textBeforeLink: text, url: null };
  }
}

async function get_all_data() {
  const response = await fetch(`/get-all-data`);
  const values = await response.json();
  return values;
}

async function getCarBrandsAndModels(values) {
  function clearCarModelsOptions() {
    while (carModelsSelect.options.length > 0) {
      carModelsSelect.remove(0);
    }
  }
  
  for (let row of values) {
    const brand = row[0];
    const option = document.createElement("option");
    option.text = brand;
    carBrandsSelect.add(option);
  }

  function getCarModels() {
    clearCarModelsOptions(); // Предварительно удалить все опции
    const selectedBrand = carBrandsSelect.value;

    for (let [brand, ...models] of values) {
      if (brand === selectedBrand) {
        for (let model of models) {
          const option = document.createElement("option");
          option.text = model;
          carModelsSelect.add(option);
        }
      }
    }

    if (carModelsSelect.options.length > 0) {
      carModelsSelect.disabled = false;
    }
  }

  carBrandsSelect.onchange = getCarModels;
}

async function do_source(flatValues) {
  try {
    flatValues.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;
      sourceElement.appendChild(optionElement);
    });
  } catch (error) {
    console.error(error.message);
  }
}

async function fetchData(flatValues) {
  try {
    flatValues.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;
      selectElement.appendChild(optionElement);
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

$(document).ready(function () {
  $('input[type="tel"]').inputmask({ "mask": "7 (999) 999 99-99" });
});

function validateName(input) {
  let value = input.value;

  value = value.replaceAll(/\d+/g, "");
  input.value = value;
  input.setCustomValidity("");
}

function getValues() {
  const data = Object.fromEntries(
    Object.entries(fields).map(([key, selector]) => [
      key,
      document.querySelector(selector).value,
    ])
  );

  const buttons = document.querySelectorAll(".btn_multiselect");
  let buttonValues = [];

  buttons.forEach((button) => {
    const buttonValue = button.textContent.trim();
    buttonValues.push(buttonValue);
  });

  buttonValues = buttonValues.join(", ");

  return { data, buttonValues };
}

async function change() {
  const one = [
    "input",
    ".select",
    ".container",
    ".field_multiselect",
    ".field_select",
    ".field_select option",
  ];

  const two = ["button", ".field_multiselect button", ".input-label"];

  const three = [".c-car-spinner__svg-circle", "#car-picture-icon"];

  one.forEach((t) => {
    document.querySelectorAll(t).forEach((el) => {
      if (el) {
        el.style.color = colors.text;
        el.style.backgroundColor = colors.bg;
      }
    });
  });

  two.forEach((t) => {
    document.querySelectorAll(t).forEach((el) => {
      if (el) {
        el.style.color = colors.button_text;
        el.style.backgroundColor = colors.button_bg;
      }
    });
  });

  three.forEach((t) => {
    document.querySelector(t).style.stroke = colors.button_bg;
  });

  document.querySelector(one[3]).style.border = `2px solid ${colors.button_bg}`;
  document.querySelector("body").style.backgroundColor = colors.body_bg;
}

fill_tg.addEventListener("click", async () => {
  await tg.requestContact(async (shared, callback) => {
    if (shared && callback) {
      console.log(callback);
      const contact = callback.responseUnsafe.contact;
      const name = `${contact.first_name} ${contact.last_name}`;
      const phone = contact.phone_number;
      n.value = name;
      ph.value = phone;
      setCheckmark(fill_tg);
    }
  });
});

/**
 * Инициализация переменных для элементов мультиселекта.
 */
let multiselect = document.querySelector(".multiselect_block");
let label = multiselect.querySelector(".field_multiselect");
let select = multiselect.querySelector(".field_select");
let text = label.innerHTML;

/**
 * Обработчик события клика вне выпадающего списка для скрытия списка.
 */
document.addEventListener("click", function (event) {
  // Проверяем, содержит ли событие элемент выпадающего списка или его метки
  if (!select.contains(event.target) && !label.contains(event.target)) {
    // Если событие не происходит внутри списка или его метки, скрываем список
    select.style.display = "none";
  }
});

/**
 * Функция создания кнопок для выбранных опций мультиселекта.
 * @param {HTMLOptionElement} option - Выбранная опция.
 * @param {HTMLElement} label - Элемент для отображения выбранных значений.
 * @param {HTMLSelectElement} select - Элемент мультиселекта.
 * @param {string} text - Текст для отображения в мультиселекте.
 */
function do_buttons(option, label, select, text) {
  let button = document.createElement("button");
  button.type = "button";
  button.className = "btn_multiselect";
  button.textContent = option.value;

  if (!chat_id) {
    button.style.backgroundColor = colors.button_bg;
    button.style.color = colors.button_text;
  }

  button.onclick = (event) => {
    event.stopPropagation(); // Останавливаем распространение события
    option.selected = false;
    button.remove();
    if (!select.selectedOptions.length) label.innerHTML = text;
  };
  label.append(button);
}

/**
 * Обработчик события клика по метке для отображения или скрытия выпадающего списка.
 */
label.addEventListener("click", () => {
  select.style.display = select.style.display === "block" ? "none" : "block";

  if (select.style.display === "block") {
    select.focus();
  }
});

/**
 * Обработчик изменения выбранных опций в мультиселекте для отображения кнопок выбора.
 */
select.addEventListener("change", () => {
  let selectedOptions = select.selectedOptions;
  label.innerHTML = "";
  for (let option of selectedOptions) {
    do_buttons(option, label, select, text);
  }
});

// Добавляем обработчик событий для кнопок в мультиселекте для предотвращения открытия опций.
multiselect.querySelectorAll(".btn_multiselect").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation(); // Останавливаем распространение события
  });
});

/**
 * Асинхронная функция select_all для выбора всех опций в мультиселекте.
 */
async function select_all() {
  let options = select.options;
  label.innerHTML = "";

  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    option.selected = true;

    do_buttons(option, label, select, text);
  }
}

if (chat_id) {
  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();
  tg.setBottomBarColor("bottom_bar_bg_color");

  tg.onEvent("mainButtonClicked", async (event) => {
    tg.MainButton.showProgress(true);

    const {
      data: { name, phone, date, time, gosnum, brand, model, source },
      buttonValues,
    } = getValues();

    if (
      name &&
      phone &&
      date &&
      time &&
      gosnum &&
      brand &&
      model &&
      source &&
      buttonValues &&
      chat_id
    ) {
      try {
        const response = await fetch(
          `/savedata?name=${encodeURIComponent(
            name
          )}&phone=${encodeURIComponent(phone)}&brand=${encodeURIComponent(
            brand
          )}&model=${encodeURIComponent(model)}&gosnum=${encodeURIComponent(
            gosnum
          )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
            time
          )}&manager=${encodeURIComponent(
            manager
          )}&chat_id=${chat_id}&visit=${encodeURIComponent(
            buttonValues
          )}&source=${source}&tg=true`
        );
        const { success } = await response.json();
        if (success) {
          container.style.display = "none";
          const check = document.querySelector(".success-checkmark");
          check.style.display = "block";

          tg.MainButton.hideProgress();
          tg.MainButton.hide();
          setTimeout(() => {
            tg.close();
          }, 3000);
        }
      } catch (error) {
        tg.showPopup({
          title: "Error",
          message: error,
        });
        tg.MainButton.hideProgress();
      }
    } else {
      tg.showPopup({
        message: "Вначале заполните все данные",
      });
      tg.MainButton.hideProgress();
    }
  });
} else {
  send.addEventListener("click", async (event) => {
    event.preventDefault();

    const {
      data: { name, phone, date, time, gosnum, brand, model, source },
      buttonValues,
    } = getValues();

    if (
      name &&
      phone &&
      date &&
      time &&
      gosnum &&
      brand &&
      model &&
      source &&
      buttonValues
    ) {
      const success_text = `${name}, пропуск для Вас заказан на ${date} для автомобиля ${brand} ${model}, госномер ${gosnum}. Ссылка для навигатора - https://yandex.ru/maps/-/CCQdrLAg-D`;

      try {
        preloader.style.display = "block";
        container.style.display = "none";

        const response = await fetch(
          `/savedata?name=${encodeURIComponent(
            name
          )}&phone=${encodeURIComponent(phone)}&brand=${encodeURIComponent(
            brand
          )}&model=${encodeURIComponent(model)}&gosnum=${encodeURIComponent(
            gosnum
          )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
            time
          )}&manager=${encodeURIComponent(
            manager
          )}&chat_id=${chat_id}&visit=${encodeURIComponent(
            buttonValues
          )}&source=${source}`
        );
        const { success } = await response.json();
        if (success) {
          preloader.style.display = "none";
          const check = document.querySelector(".success-checkmark");
          check.style.display = "block";

          showBottomBar(success_text);
        } else {
        }
      } catch (error) {
        showBottomBar(error.message);
      }
    } else {
      showBottomBar("Вначале заполните все данные");
    }
  });
}

$(document).ready(function () {
  // Генерируем параметры для выбора даты
  var currentDate = new Date();
  var year = currentDate.getFullYear();
  var month = currentDate.getMonth() + 1;
  var day = currentDate.getDate();
  var dateOptions = "";
  for (var i = 0; i < 30; i++) {
    var date = new Date(year, month - 1, day + i);
    var dateString =
      ("0" + date.getDate()).slice(-2) +
      "." +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "." +
      date.getFullYear();
    dateOptions += `<option value="${dateString}">${dateString}</option>`;
  }
  $("#date").html(dateOptions);

  // Генерируем параметры для выбора времени
  var timeOptions = "";
  for (var h = 9; h <= 19; h++) {
    var hourString = h.toString().padStart(2, "0");
    for (var m = 0; m < 60; m += 30) {
      var minuteString = m.toString().padStart(2, "0");
      var timeString = `${hourString}:${minuteString}`;
      timeOptions += `<option value="${timeString}">${timeString}</option>`;
    }
  }
  $("#time").html(timeOptions);

  // Обработчик изменения выбранной даты или времени
  $("#date, #time").change(function () {
    var selectedDate = $("#date").val();
    var selectedTime = $("#time").val();
    var dateTimeString = selectedDate + "T" + selectedTime;
    $("#datetime").val(dateTimeString);
  });
});

// скрываем bottom sheet
$(".backdrop").click(() => {
  $(".bottom-sheet-wrapper").removeClass("show-modal");
  document.querySelector(".bottom-sheet").style.display = "none";
});

async function preload() {
  if (chat_id) {
    tg.MainButton.hide();
  } else {
    await change();
    send.style.display = "block";
    fill_tg.style.display = "none";
    fill_text.style.display = "none";
  }

  const { data } = await get_all_data();

  await fetchData(data.for_pass);
  await getCarBrandsAndModels(data["'Cars Brands'"]);
  await do_source(data["'Данные для Монитора заказов'"]);
  await select_all();

  preloader.style.display = "none";
  container.style.display = "flex";

  if (chat_id) {
    tg.MainButton.show();
    tg.MainButton.setParams({
      has_shine_effect: true,
      text: "Отправить данные",
    });
  }
}

preload();
