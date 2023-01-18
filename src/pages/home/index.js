window.onload = () => {
  loadUser();
  setInitialDate();
  getAndRenderTasks();
};

function openPage(url) {
  document
    .getElementById("body-element")
    .classList.remove("enterPage-animation");
  document.getElementById("body-element").classList.add("outPage-animation");
  setTimeout(() => {
    window.open(url, "_self");
  }, 1000);
}

async function loadUser() {
  const token = localStorage.getItem("@Weekly:token");
  const userId = localStorage.getItem("@Weekly:user_id");
  const userName = localStorage.getItem("@Weekly:userName");
  const userEmail = localStorage.getItem("@Weekly:userEmail");

  if (!token || !userId || !userName || !userEmail) {
    openPage("../../index.html");
  }

  const result = tryGetUser(token, userEmail);

  if (result.error) {
    openPage("../../index.html");
  }

  document.getElementById("home-page-username-text").innerText = userName;
}

function setInitialDate() {
  const dateInput = document.getElementById("home-page-date-input");
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
  dateInput.addEventListener("Change", () => {
    renderTasks();
  });
  const finalDate = dateFns.addDays(today, 6).toISOString().split("T")[0];
  document.getElementById("home-page-final-date").value = finalDate;
}

async function getAndRenderTasks() {
  const weekDays = [];
  const token = localStorage.getItem("@Weekly:token");
  const email = localStorage.getItem("@Weekly:userEmail");
  const initialDate = document.getElementById("home-page-date-input").value;
  const finalDate = document.getElementById("home-page-final-date").value;

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

  console.log(tasks);

  for (let i = 0; i < 7; i++) {
    let HTMLstring = "";
    const initialHour = weekDays[i] + "T00:00:00.000Z";
    const finalHour = weekDays[i] + "T23:59:59.000Z";

    for (let j = 0; j < tasks.length; j++) {
      if (
        tasks[j].initialDate > initialHour &&
        tasks[j].initialDate < finalHour
      ) {
        HTMLstring =
          HTMLstring +
          `<button onClick="onClickTask('${tasks[j]._id.toString()}')" ` +
          "class='home-page-button-card' style='background-color:" +
          tasks[j].hexColor +
          "ab' ><h6>" +
          tasks[j].task +
          "</h6><p>" +
          tasks[j].initialDate.slice(11, 16) +
          " - " +
          tasks[j].finalDate.slice(11, 16) +
          "</p></button>";
      }
    }

    console.log(weekDays[i]);
    HTMLstring =
      HTMLstring +
      `<button onClick="onClickAddTask('${weekDays[
        i
      ].toString()}')" class='home-page-add-button-card'><h5>+</h5></button>`;

    document.getElementById("list-day-" + i).innerHTML = HTMLstring;
  }
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
    const tasks = await result.json();
    return tasks;
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

function onClickAddTask(date) {
  window.alert(date);
}

function onClickTask(taskId) {
  window.alert("taskId: " + taskId);
}
