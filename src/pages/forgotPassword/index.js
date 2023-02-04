let email = "";
let token = "";
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

function pageFadeIn() {
  document
    .getElementById("main-container")
    .classList.remove("outPage-animation");
  document
    .getElementById("main-container")
    .classList.add("enterPage-animation");
}

function pageFadeOut() {
  document
    .getElementById("main-container")
    .classList.remove("enterPage-animation");
  document.getElementById("main-container").classList.add("outPage-animation");
}

async function sendEmail() {
  pageFadeOut();

  email = document.getElementById("email-input").value;

  if (email.length < 3 || !email.includes("@") || !email.includes(".")) {
    return window.alert("Escreva um e-mail válido");
  }

  setTimeout(async () => {
    const result = await tryForgotPassword();

    if (result.error) {
      pageFadeIn();
      document.getElementById("email-input").value = "";
      return window.alert("E-mail não encontrado");
    }

    document.getElementById("email-input").hidden = true;
    document.getElementById("email-written").hidden = false;
    document.getElementById("email-written").innerText = email;
    document.getElementById("token-input").hidden = false;
    document.getElementById("continue-button").onclick = () => {
      getToken();
    };
    pageFadeIn();
  }, 1000);
}

function getToken() {
  pageFadeOut();
  setTimeout(async () => {
    token = document.getElementById("token-input").value;

    document.getElementById("token-input").hidden = true;
    document.getElementById("token-written").hidden = false;
    document.getElementById("token-written").innerText = token;
    document.getElementById("password-input").hidden = false;
    document.getElementById("input-section").style.margin = "30px";
    document.getElementById("number-keyboard").hidden = false;
    document.getElementById("continue-button").hidden = true;
    pageFadeIn();
  }, 1000);
}

function restartPasswordNumber() {
  password = "";
  document.getElementById("password-input").value = "";
}

function addPasswordNumber(number) {
  if (password.length < 6) {
    password = password + number;

    const length = password.length;
    const a = document.getElementById("password-input").value;
    let startText = "";
    for (let i = 0; i < length; i++) {
      startText = startText + "O ";
    }

    document.getElementById("password-input").value =
      startText + a.slice(length * 2, 11);
  }

  if (password.length == 6) {
    resetPassword();
  }
}

async function resetPassword() {
  const result = await tryResetPassword();

  if (result.error) {
    window.alert("Token inválido");
    openPage("./index.html");
    return;
  }
  openPage("../login/index.html");
}

const tryForgotPassword = async () => {
  try {
    const result = await fetch("https://weekly.herokuapp.com/forgot-password", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};

const tryResetPassword = async () => {
  try {
    const result = await fetch("https://weekly.herokuapp.com/reset-password", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        email: email,
        password: password,
      }),
    });
    const data = await result.json();
    return data;
  } catch (error) {
    return { error };
  }
};
