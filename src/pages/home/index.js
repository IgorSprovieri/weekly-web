function openPage(url) {
  document
    .getElementById("body-element")
    .classList.remove("enterPage-animation");
  document.getElementById("body-element").classList.add("outPage-animation");
  setTimeout(() => {
    window.open(url, "_self");
  }, 1000);
}

function onClickExit() {
  localStorage.removeItem("@Weekly:token");
  localStorage.removeItem("@Weekly:user_id");
  localStorage.removeItem("@Weekly:userName");
  localStorage.removeItem("@Weekly:userEmail");

  openPage("../../index.html");
}

/*
####################################################
onload Functions
*/

window.onload = async () => {
  await loadUser();
  await getAppColors();
  await setInitialDate();
  await getAndRenderTasks();

  const form = document.getElementById("task-form");
  form.onsubmit = (event) => {
    event.preventDefault();
  };
};

async function loadUser() {
  const token = localStorage.getItem("@Weekly:token");
  const userId = localStorage.getItem("@Weekly:user_id");
  const userName = localStorage.getItem("@Weekly:userName");
  const userEmail = localStorage.getItem("@Weekly:userEmail");

  if (!token || !userId || !userName || !userEmail) {
    return openPage("../../index.html");
  }

  const result = tryGetUser();

  if (result.error) {
    return openPage("../../../index.html");
  }

  document.getElementById("home-page-username-text").innerText = userName;
}

async function getAppColors() {
  const colorsList = await tryGetAppColors();
  const colorsDataList = document.getElementById("app-colors");

  colorsList.map((item) => {
    const optionElement = document.createElement("option");
    optionElement.value = item.hexColor;
    colorsDataList.appendChild(optionElement);
  });
}

async function setInitialDate() {
  const dateInput = document.getElementById("home-page-date-input");
  let previousMonday = new Date();

  previousMonday.setDate(
    previousMonday.getDate() - ((previousMonday.getDay() + 6) % 7)
  );

  const year = previousMonday.getFullYear();
  const month = previousMonday.getMonth() + 1;
  const day = previousMonday.getDate();

  if (month < 10) {
    dateInput.value = `${year}-0${month}-${day}`;
  } else {
    dateInput.value = `${year}-${month}-${day}`;
  }

  dateInput.addEventListener("change", async () => {
    const dateInput = document.getElementById("home-page-date-input");
    const finalDate = await tryGetAddDays(dateInput.value, 6);
    document.getElementById("home-page-final-date").value =
      finalDate.split("T")[0];
    getAndRenderTasks();
  });

  const finalDate = await tryGetAddDays(dateInput.value, 6);
  document.getElementById("home-page-final-date").value =
    finalDate.split("T")[0];
}

async function getAndRenderTasks() {
  const initialDate = document.getElementById("home-page-date-input").value;
  const finalDate = document.getElementById("home-page-final-date").value;
  const listsContainer = document.getElementById("home-page-lists-container");
  document.getElementById("home-page-loading").style.display = "flex";
  listsContainer.innerHTML = "";

  const tasks = await tryGetTasks(initialDate, finalDate);
  const weekDays = await tryGetListOfDays(initialDate, 7);

  if (tasks.error || weekDays.error) {
    return window.alert("Erro ao carregar as tarefas");
  }

  document.getElementById("home-page-loading").style.display = "none";

  function getWeekDay(date) {
    let days = ["S", "T", "Q", "Q", "S", "S", "D"];
    return days[date.getDay()];
  }

  weekDays.map((weekDay, i) => {
    document.getElementById("week-day-" + i).innerText = getWeekDay(
      new Date(weekDay)
    );
  });

  weekDays.map((day) => {
    const listDayElement = document.createElement("div");
    listDayElement.classList.add("home-page-list-cards-container");
    const initialHour = day + "T00:00:00.000Z";
    const finalHour = day + "T23:59:59.000Z";

    tasks.map((task) => {
      if (task.initialDate > initialHour && task.initialDate < finalHour) {
        const taskButton = document.createElement("button");
        taskButton.classList.add("home-page-button-card");
        taskButton.id = task._id;
        task.hexColor = task.hexColor + "ab";
        taskButton.style.backgroundColor = task.hexColor;
        if (task.checked == true) {
          taskButton.innerHTML = `<h6><s>${
            task.task
          }</s></h6><p>${task.initialDate.slice(
            11,
            16
          )} - ${task.finalDate.slice(11, 16)}</p>`;
        } else {
          taskButton.innerHTML = `<h6>${
            task.task
          }</h6><p>${task.initialDate.slice(11, 16)} - ${task.finalDate.slice(
            11,
            16
          )}</p>`;
        }

        taskButton.onclick = () => {
          openInfoFooter(task);
        };

        listDayElement.appendChild(taskButton);
      }
    });

    const addButton = document.createElement("button");
    addButton.innerHTML = "<h5>+</h5>";
    addButton.classList.add("home-page-add-button-card");
    addButton.onclick = () => {
      openForm();
      onClickAddTaskCardButton(day.toString());
    };
    listDayElement.appendChild(addButton);
    listsContainer.appendChild(listDayElement);
  });
}

/*
####################################################
Calendar Functions
*/
function onClickPreviousWeek() {
  addDaysOnCalendar(-7);
}

function onClickNextWeek() {
  addDaysOnCalendar(7);
}

async function addDaysOnCalendar(days) {
  const dateInput = document.getElementById("home-page-date-input");
  const startDate = await tryGetAddDays(dateInput.value, days);
  const finalDate = await tryGetAddDays(startDate, 6);

  dateInput.value = startDate.split("T")[0];
  document.getElementById("home-page-final-date").value =
    finalDate.split("T")[0];

  getAndRenderTasks();
}

/*
####################################################
Card Button Functions
*/

function onClickAddTaskCardButton(date) {
  document.getElementById("form-title").innerText = "Adicionar Tarefa";
  document.getElementById("form-input-day").value = date;
  document.getElementById("form-input-task").value = "";
  document.getElementById("form-input-initial-Hour").value = "12:00";
  document.getElementById("form-input-final-Hour").value = "13:00";
  document.getElementById("form-input-color").value = "#FFFFFF";
  document.getElementById("form-input-description").value = "";
  document.getElementById("form-submit-button").innerText = "Criar";
  document.getElementById("form-submit-button").onclick = () => {
    onClickSubmitAddTask();
  };
}

/*
####################################################
Form Functions
*/
async function onClickSubmitAddTask() {
  closeForm();
  const day = document.getElementById("form-input-day").value;
  const initialHour = document.getElementById("form-input-initial-Hour").value;
  const finalHour = document.getElementById("form-input-final-Hour").value;

  if (finalHour < initialHour) {
    window.alert("A hora final precisa ser maior que a inicial");
    return;
  }

  const bodyData = {
    task: document.getElementById("form-input-task").value,
    hexColor: document.getElementById("form-input-color").value,
    initialDate: `${day}T${initialHour}:00.000Z`,
    finalDate: `${day}T${finalHour}:00.000Z`,
    description: document.getElementById("form-input-description").value,
    checked: document.getElementById("form-input-checked").checked,
  };

  const result = await tryPostTask(bodyData);

  if (result.error) {
    return window.alert("Erro ao adicionar a tarefa");
  }

  getAndRenderTasks();
}

async function onClickSubmitEditTask(taskId) {
  closeForm();
  const day = document.getElementById("form-input-day").value;
  const initialHour = document.getElementById("form-input-initial-Hour").value;
  const finalHour = document.getElementById("form-input-final-Hour").value;

  if (finalHour < initialHour) {
    window.alert("A hora final precisa ser maior que a inicial");
    return;
  }

  const bodyData = {
    task: document.getElementById("form-input-task").value,
    initialDate: `${day}T${initialHour}:00.000Z`,
    finalDate: `${day}T${finalHour}:00.000Z`,
    hexColor: document.getElementById("form-input-color").value,
    description: document.getElementById("form-input-description").value,
    checked: document.getElementById("form-input-checked").checked,
  };

  const result = await tryPutTask(bodyData, taskId);

  if (result.error) {
    return window.alert("Erro ao editar a tarefa");
  }

  getAndRenderTasks();
}

function closeForm() {
  document.getElementById("task-form").classList.remove("transformRight");
  document.getElementById("task-form").classList.add("transformLeft");
  document.getElementById("form-section").classList.remove("fadeIn");
  document.getElementById("form-section").classList.add("fadeOut");

  setTimeout(() => {
    document.getElementById("form-section").hidden = true;
  }, 1000);
}

function openForm() {
  document.getElementById("form-section").hidden = false;

  document.getElementById("task-form").classList.remove("transformLeft");
  document.getElementById("task-form").classList.add("transformRight");
  document.getElementById("form-section").classList.remove("fadeOut");
  document.getElementById("form-section").classList.add("fadeIn");
}

/*
###########################################################
Info Section Functions
*/

function closeInfoFooter() {
  document.getElementById("info-container").classList.remove("transformUp");
  document.getElementById("info-container").classList.add("transformDown");
  document.getElementById("info-footer").classList.remove("fadeIn");
  document.getElementById("info-footer").classList.add("fadeOut");

  setTimeout(() => {
    document.getElementById("info-footer").hidden = true;
  }, 1000);
}

function openInfoFooter(task) {
  document.getElementById("info-footer").hidden = false;
  document.getElementById("info-container").classList.remove("transformDown");
  document.getElementById("info-container").classList.add("transformUp");
  document.getElementById("info-footer").classList.remove("fadeOut");
  document.getElementById("info-footer").classList.add("fadeIn");

  const infoTask = document.getElementById("info-footer-task");
  const infoTime = document.getElementById("info-footer-time");
  const infoDescription = document.getElementById("info-footer-description");

  if (task.checked == true) {
    infoTask.innerHTML = `<s>${task.task}</s>`;
  } else {
    infoTask.innerText = task.task;
  }

  infoTime.innerText = `${task.initialDate.slice(
    11,
    16
  )} - ${task.finalDate.slice(11, 16)}`;

  if (task.description == "") {
    infoDescription.innerText = "Sem descrição";
  } else {
    infoDescription.innerText = task.description;
  }

  const checkButton = document.getElementById("info-check-button");
  const editbutton = document.getElementById("info-edit-button");
  const deleteButton = document.getElementById("info-delete-button");

  checkButton.onclick = () => {
    onClickCheckTask(task);
  };
  editbutton.onclick = () => {
    closeInfoFooter();
    openForm();
    onClickEditTask(task);
  };
  deleteButton.onclick = () => {
    closeInfoFooter();
    onClickDeleteTask(task);
  };
}

async function onClickCheckTask(task) {
  const bodyData = {
    checked: !task.checked,
  };

  const result = await tryPutTask(bodyData, task._id);

  if (result.error) {
    return window.alert("Não foi possível concluir a tarefa");
  }

  task.checked = !task.checked;

  const firstElement = document.getElementById(task._id).firstElementChild;
  const infoTask = document.getElementById("info-footer-task");

  if (task.checked == true) {
    firstElement.innerHTML = `<s>${task.task}</s>`;
    infoTask.innerHTML = `<s>${task.task}</s>`;
  } else {
    firstElement.innerHTML = `${task.task}`;
    infoTask.innerText = task.task;
  }
}

function onClickEditTask(task) {
  document.getElementById("form-title").innerText = "Editar Tarefa";
  document.getElementById("form-input-day").value =
    task.initialDate.split("T")[0];
  document.getElementById("form-input-task").value = task.task;
  document.getElementById("form-input-initial-Hour").value =
    task.initialDate.slice(11, 16);
  document.getElementById("form-input-final-Hour").value = task.finalDate.slice(
    11,
    16
  );
  document.getElementById("form-input-color").value = task.hexColor.slice(0, 7);
  document.getElementById("form-input-description").value = task.description;
  document.getElementById("form-input-checked").checked = task.checked;
  document.getElementById("form-submit-button").innerText = "Editar";
  document.getElementById("form-submit-button").onclick = () => {
    onClickSubmitEditTask(task._id);
  };
}

async function onClickDeleteTask(task) {
  const result = await tryDeleteTask(task._id);

  if (result.error) {
    return window.alert("Não foi possível deletar a tarefa");
  }

  document.getElementById(task._id).remove();
}
/*
###########################################################
API Requests
*/

const tryGetAddDays = async (date, days) => {
  try {
    date = new Date(date).toISOString().split("T")[0];
    const result = await fetch(
      `https://weekly.herokuapp.com/addDays/?date=${date}T08%3A00%3A00.000Z&days=${days}`
    );
    const data = await result.json();
    return data.result;
  } catch (error) {
    return { error };
  }
};

const tryGetListOfDays = async (date, days) => {
  try {
    date = new Date(date).toISOString().split("T")[0];
    const result = await fetch(
      `https://weekly.herokuapp.com/list-of-days/?date=${date}T08%3A00%3A00.000Z&days=${days}`
    );
    const data = await result.json();
    return data.result;
  } catch (error) {
    return { error };
  }
};

const tryGetAppColors = async () => {
  try {
    const result = await fetch("https://weekly.herokuapp.com/colors");
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};

// Auth Requests
const getHeader = () => {
  const token = localStorage.getItem("@Weekly:token");
  const email = localStorage.getItem("@Weekly:userEmail");

  const data = new Object();
  data.token = token;
  data.email = email;

  return data;
};

const tryGetUser = async () => {
  try {
    const { token, email } = getHeader();

    const result = await fetch("https://weekly.herokuapp.com/user", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        email: email,
      },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};

const tryGetTasks = async (initialDate, finalDate) => {
  try {
    const { token, email } = getHeader();

    const result = await fetch(
      `https://weekly.herokuapp.com/task?initialDate=${initialDate}T00%3A00%3A00.000Z&finalDate=${finalDate}T23%3A59%3A59.000Z`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          email: email,
        },
      }
    );
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};

const tryPostTask = async (bodyData) => {
  try {
    const { token, email } = getHeader();

    const result = await fetch("https://weekly.herokuapp.com/task", {
      method: "post",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        email: email,
      },
      body: JSON.stringify(bodyData),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};

const tryPutTask = async (bodyData, taskId) => {
  try {
    const { token, email } = getHeader();

    const result = await fetch(`https://weekly.herokuapp.com/task/${taskId}`, {
      method: "put",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        email: email,
      },
      body: JSON.stringify(bodyData),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};

const tryDeleteTask = async (taskId) => {
  try {
    const { token, email } = getHeader();

    const result = await fetch(`https://weekly.herokuapp.com/task/${taskId}`, {
      method: "delete",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        email: email,
      },
    });
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};
