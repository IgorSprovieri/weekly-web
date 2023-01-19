window.onload = () => {
  loadUser();
  setInitialDate();
  getAndRenderTasks();
};

async function loadUser() {
  const token = localStorage.getItem("@Weekly:token");
  const userId = localStorage.getItem("@Weekly:user_id");
  const userName = localStorage.getItem("@Weekly:userName");
  const userEmail = localStorage.getItem("@Weekly:userEmail");

  if (!token || !userId || !userName || !userEmail) {
    openPage("../../index.html");
    return;
  }

  const result = tryGetUser(token, userEmail);

  if (result.error) {
    openPage("../../index.html");
    return;
  }

  document.getElementById("home-page-username-text").innerText = userName;
}

function setInitialDate() {
  const dateInput = document.getElementById("home-page-date-input");
  let prevMonday = new Date();
  prevMonday.setDate(prevMonday.getDate() - ((prevMonday.getDay() + 6) % 7));

  dateInput.value = prevMonday.toISOString().split("T")[0];
  dateInput.addEventListener("change", () => {
    const dateInput = document.getElementById("home-page-date-input");
    const finalDate = dateFns
      .addDays(dateInput.value, 6)
      .toISOString()
      .split("T")[0];
    document.getElementById("home-page-final-date").value = finalDate;
    getAndRenderTasks();
  });
  const finalDate = dateFns.addDays(prevMonday, 6).toISOString().split("T")[0];
  document.getElementById("home-page-final-date").value = finalDate;
}

async function getAndRenderTasks() {
  const weekDays = [];
  const token = localStorage.getItem("@Weekly:token");
  const email = localStorage.getItem("@Weekly:userEmail");
  const initialDate = document.getElementById("home-page-date-input").value;
  const finalDate = document.getElementById("home-page-final-date").value;
  const listsContainer = document.getElementById("home-page-lists-container");
  document.getElementById("loading-hidden-content").hidden = false;
  listsContainer.innerHTML = "";

  const result = await tryGetTasks(initialDate, finalDate, token, email);
  if (result.error) {
    window.alert(result.error);
    return;
  }

  function getWeekDay(date) {
    let days = ["S", "T", "Q", "Q", "S", "S", "D"];
    return days[date.getDay()];
  }

  dateAux = new Date(initialDate);
  for (let i = 0; i < 7; i++) {
    document.getElementById("week-day-" + i).innerText = getWeekDay(dateAux);
    weekDays.push(dateAux.toISOString().split("T")[0]);
    dateAux = dateFns.addDays(dateAux, 1);
  }

  const tasks = await tryGetTasks(initialDate, finalDate, token, email);

  if (tasks.error) {
    window.alert("Erro ao carregar as tarefas");
    return;
  }

  document.getElementById("loading-hidden-content").hidden = true;

  weekDays.map((day) => {
    const listDayElement = document.createElement("div");
    listDayElement.classList.add("home-page-list-cards-container");
    const initialHour = day + "T00:00:00.000Z";
    const finalHour = day + "T23:59:59.000Z";

    tasks.map((task) => {
      if (task.initialDate > initialHour && task.initialDate < finalHour) {
        const taskButton = document.createElement("div");
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

  console.log(listsContainer.innerHTML);
}

const tryGetTasks = async (initialDate, finalDate, token, email) => {
  try {
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

const tryGetUser = async (token, email) => {
  try {
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

function onClickExit() {
  localStorage.removeItem("@Weekly:token");
  localStorage.removeItem("@Weekly:user_id");
  localStorage.removeItem("@Weekly:userName");
  localStorage.removeItem("@Weekly:userEmail");

  openPage("../../index.html");
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

function onClickAddTaskCardButton(date) {
  document.getElementById("add-task").hidden = false;
  document.getElementById("add-task-day").value = date;
  document.getElementById("add-task-initial-Hour").value = "12:00";
  document.getElementById("add-task-final-Hour").value = "13:00";
}

async function onClickAddTask() {
  document.getElementById("add-task").hidden = true;
  const day = document.getElementById("add-task-day").value;
  const initialHour = document.getElementById("add-task-initial-Hour").value;
  const finalHour = document.getElementById("add-task-final-Hour").value;
  const token = localStorage.getItem("@Weekly:token");
  const email = localStorage.getItem("@Weekly:userEmail");

  if (finalHour < initialHour) {
    window.alert("A hora final precisa ser maior que a inicial");
    return;
  }

  const result = await tryPostTask(token, email, day, initialHour, finalHour);

  if (result.error) {
    window.alert("Erro ao adicionar a tarefa: " + result.error);
    return;
  }

  getAndRenderTasks();
}

const tryPostTask = async (token, email, day, initialHour, finalHour) => {
  try {
    const bodyData = {
      task: document.getElementById("add-task-task").value,
      hexColor: document.getElementById("add-task-color").value,
      initialDate: `${day}T${initialHour}:00.000Z`,
      finalDate: `${day}T${finalHour}:00.000Z`,
      description: document.getElementById("add-task-description").value,
      checked: document.getElementById("add-task-checked").checked,
    };

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

function onClickBackAddTask() {
  document.getElementById("add-task").hidden = true;
}

function onClickPreviousWeek() {
  const dateInput = document.getElementById("home-page-date-input");
  const startDate = dateFns
    .addDays(dateInput.value, -7)
    .toISOString()
    .split("T")[0];
  const finalDate = dateFns.addDays(startDate, 6).toISOString().split("T")[0];

  dateInput.value = startDate;
  document.getElementById("home-page-final-date").value = finalDate;

  getAndRenderTasks();
}

function onClickNextWeek() {
  const dateInput = document.getElementById("home-page-date-input");
  const startDate = dateFns
    .addDays(dateInput.value, 7)
    .toISOString()
    .split("T")[0];
  const finalDate = dateFns.addDays(startDate, 6).toISOString().split("T")[0];

  dateInput.value = startDate;
  document.getElementById("home-page-final-date").value = finalDate;

  getAndRenderTasks();
}

function onClickCheckTask(task) {
  window.alert(task.checked);
}

function onClickEditTask(task) {
  window.alert("Edit Task: " + task._id);
}

async function onClickDeleteTask(task) {
  const token = localStorage.getItem("@Weekly:token");
  const email = localStorage.getItem("@Weekly:userEmail");

  try {
    const result = await fetch(
      `https://weekly.herokuapp.com/task/${task._id}`,
      {
        method: "delete",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          email: email,
        },
      }
    );
    await result.json();
    document.getElementById(task._id).remove();
    return;
  } catch (error) {
    window.alert("Erro ao deletar tarefa: " + error);
    return;
  }
}
