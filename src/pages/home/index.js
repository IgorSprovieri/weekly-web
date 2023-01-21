window.onload = () => {
  loadUser();
  getAppColors();
  setInitialDate();
  getAndRenderTasks();
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
    return openPage("../../index.html");
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

function setInitialDate() {
  const dateInput = document.getElementById("home-page-date-input");
  let previousMonday = new Date();
  previousMonday.setDate(
    previousMonday.getDate() - ((previousMonday.getDay() + 6) % 7)
  );

  dateInput.value = previousMonday.toISOString().split("T")[0];
  dateInput.addEventListener("change", () => {
    const dateInput = document.getElementById("home-page-date-input");
    const finalDate = dateFns
      .addDays(dateInput.value, 6)
      .toISOString()
      .split("T")[0];
    document.getElementById("home-page-final-date").value = finalDate;
    getAndRenderTasks();
  });

  const finalDate = dateFns
    .addDays(previousMonday, 6)
    .toISOString()
    .split("T")[0];
  document.getElementById("home-page-final-date").value = finalDate;
}

async function getAndRenderTasks() {
  const weekDays = [];
  const initialDate = document.getElementById("home-page-date-input").value;
  const finalDate = document.getElementById("home-page-final-date").value;
  const listsContainer = document.getElementById("home-page-lists-container");
  document.getElementById("home-page-loading").style.display = "flex";
  listsContainer.innerHTML = "";

  const result = await tryGetTasks(initialDate, finalDate);
  if (result.error) {
    window.alert(result.error);
    return;
  }

  function getWeekDay(date) {
    let days = ["S", "T", "Q", "Q", "S", "S", "D"];
    return days[date.getDay()];
  }

  let dateAux = new Date(initialDate);
  for (let i = 0; i < 7; i++) {
    document.getElementById("week-day-" + i).innerText = getWeekDay(dateAux);
    weekDays.push(dateAux.toISOString().split("T")[0]);
    dateAux = dateFns.addDays(dateAux, 1);
  }

  const tasks = await tryGetTasks(initialDate, finalDate);

  if (tasks.error) {
    return window.alert("Erro ao carregar as tarefas");
  }

  document.getElementById("home-page-loading").style.display = "none";

  weekDays.map((day) => {
    const listDayElement = document.createElement("div");
    listDayElement.classList.add("home-page-list-cards-container");
    const initialHour = day + "T00:00:00.000Z";
    const finalHour = day + "T23:59:59.000Z";

    tasks.map((task) => {
      if (task.initialDate > initialHour && task.initialDate < finalHour) {
        const taskButton = document.createElement("button");
        taskButton.classList.add("home-page-card");
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

        const imagesContainer = document.createElement("div");
        const checkImg = document.createElement("img");
        const editImg = document.createElement("img");
        const deleteImg = document.createElement("img");

        deleteImg.src = "../../../public/delete.svg";
        checkImg.src = "../../../public/check.svg";
        editImg.src = "../../../public/edit.svg";

        deleteImg.style.height = "14px";
        checkImg.style.height = "14px";
        editImg.style.height = "14px";

        editImg.style.margin = "0px 12px";

        checkImg.onclick = () => {
          onClickCheckTask(task);
        };
        editImg.onclick = () => {
          onClickEditTask(task);
        };
        deleteImg.onclick = () => {
          onClickDeleteTask(task);
        };

        imagesContainer.appendChild(checkImg);
        imagesContainer.appendChild(editImg);
        imagesContainer.appendChild(deleteImg);

        taskButton.appendChild(imagesContainer);
        listDayElement.appendChild(taskButton);
      }
    });

    const addButton = document.createElement("button");
    addButton.innerHTML = "<h5>+</h5>";
    addButton.classList.add("home-page-add-button-card");
    addButton.onclick = () => {
      onClickAddTaskCardButton(day.toString());
    };
    listDayElement.appendChild(addButton);
    listsContainer.appendChild(listDayElement);
  });
}

function openPage(url) {
  document
    .getElementById("body-element")
    .classList.remove("enterPage-animation");
  document.getElementById("body-element").classList.add("outPage-animation");
  setTimeout(() => {
    window.open(url, "_self");
  }, 1000);
}

/*
####################################################
onClick functions
*/

function onClickExit() {
  localStorage.removeItem("@Weekly:token");
  localStorage.removeItem("@Weekly:user_id");
  localStorage.removeItem("@Weekly:userName");
  localStorage.removeItem("@Weekly:userEmail");

  openPage("../../index.html");
}

function onClickAddTaskCardButton(date) {
  document.getElementById("add-task").hidden = false;
  document.getElementById("add-task-day").value = date;
  document.getElementById("add-task-initial-Hour").value = "12:00";
  document.getElementById("add-task-final-Hour").value = "13:00";
  document.getElementById("add-task-task").value = "";
  document.getElementById("add-task-description").value = "";
}

async function onClickAddTask() {
  document.getElementById("add-task").hidden = true;
  const day = document.getElementById("add-task-day").value;
  const initialHour = document.getElementById("add-task-initial-Hour").value;
  const finalHour = document.getElementById("add-task-final-Hour").value;

  if (finalHour < initialHour) {
    window.alert("A hora final precisa ser maior que a inicial");
    return;
  }

  const bodyData = {
    task: document.getElementById("add-task-task").value,
    hexColor: document.getElementById("add-task-color").value,
    initialDate: `${day}T${initialHour}:00.000Z`,
    finalDate: `${day}T${finalHour}:00.000Z`,
    description: document.getElementById("add-task-description").value,
    checked: document.getElementById("add-task-checked").checked,
  };

  const result = await tryPostTask(bodyData);

  if (result.error) {
    return window.alert("Erro ao adicionar a tarefa");
  }

  getAndRenderTasks();
}

function onClickBackAddTask() {
  document.getElementById("add-task").hidden = true;
}

function onClickPreviousWeek() {
  addDaysOnCalendar(-7);
}

function onClickNextWeek() {
  addDaysOnCalendar(7);
}

function addDaysOnCalendar(days) {
  const dateInput = document.getElementById("home-page-date-input");
  const startDate = dateFns
    .addDays(dateInput.value, days)
    .toISOString()
    .split("T")[0];
  const finalDate = dateFns.addDays(startDate, 6).toISOString().split("T")[0];

  dateInput.value = startDate;
  document.getElementById("home-page-final-date").value = finalDate;

  getAndRenderTasks();
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

  if (task.checked == true) {
    firstElement.innerHTML = `<s>${task.task}</s>`;
  } else {
    firstElement.innerHTML = `${task.task}`;
  }
}

function onClickEditTask(task) {
  window.alert("Edit Task: " + task._id);
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
