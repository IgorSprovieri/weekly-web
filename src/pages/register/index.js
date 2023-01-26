let userName = "";
let email = "";
let password = "";

function openPage(url) {
  document
    .getElementById("body-element")
    .classList.remove("enterPage-animation");
  document.getElementById("body-element").classList.add("outPage-animation");
  setTimeout(() => {
    window.open(url, "_self");
  }, 1000);
}

function onClickContinue() {
  email = document.getElementById("email-input").value;
  userName = document.getElementById("name-input").value;

  if (userName.length < 3) {
    return window.alert("Escreva um nome válido");
  }

  if (email.length < 3 || !email.includes("@") || !email.includes(".")) {
    return window.alert("Escreva um e-mail válido");
  }

  document.getElementById("main-container").classList.add("outPage-animation");

  setTimeout(() => {
    document.getElementById("input-section").style.margin = "50px";
    document.getElementById("email-input").hidden = true;
    document.getElementById("name-input").hidden = true;
    document.getElementById("continue-button").hidden = true;
    document.getElementById("name-written").hidden = false;
    document.getElementById("email-written").hidden = false;
    document.getElementById("password-input").hidden = false;
    document.getElementById("number-keyboard").hidden = false;
    document.getElementById("name-written").innerText = userName;
    document.getElementById("email-written").innerText = email;
    document
      .getElementById("main-container")
      .classList.remove("outPage-animation");
    document
      .getElementById("main-container")
      .classList.add("enterPage-animation");
  }, 1000);
  document
    .getElementById("main-container")
    .classList.remove("enterPage-animation");
}

function restartPasswordNumber() {
  password = "";
  document.getElementById("password-input").value = "";
}

function addPasswordNumber(number) {
  if (password.length < 6) {
    password = password + number;
    document.getElementById("password-input").value =
      document.getElementById("password-input").value + " O ";
  }

  if (password.length == 6) {
    register();
  }
}

async function register() {
  const result = await tryRegister();

  if (result.error) {
    window.alert(result.error);
    restartPasswordNumber();
    return;
  }
  openPage("../login/index.html");
}

const tryRegister = async () => {
  try {
    const result = await fetch("https://weekly.herokuapp.com/user", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName,
        email: email,
        password: password,
      }),
    });
    const user = await result.json();
    return user;
  } catch (error) {
    return { error };
  }
};
