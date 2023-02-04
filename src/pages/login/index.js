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
  if (email.length < 3 || !email.includes("@") || !email.includes(".")) {
    return window.alert("Write a valid email");
  }

  document.getElementById("main-container").classList.add("outPage-animation");

  setTimeout(() => {
    document.getElementById("input-section").style.margin = "30px";
    document.getElementById("email-input").hidden = true;
    document.getElementById("continue-button").hidden = true;
    document.getElementById("reset-password").hidden = false;
    document.getElementById("email-written").hidden = false;
    document.getElementById("password-input").hidden = false;
    document.getElementById("number-keyboard").hidden = false;
    document.getElementById("email-written").innerText = email;
    document
      .getElementById("main-container")
      .classList.remove("outPage-animation");
    document
      .getElementById("main-container")
      .classList.add("enterPage-animation");
  }, 1000);
}

function resetPasswordNumber() {
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
    login();
  }
}

async function login() {
  const result = await tryLogin();

  if (result.error) {
    window.alert(result.error);
    resetPasswordNumber();
    return;
  }

  localStorage.setItem("@Weekly:user_id", result.user_id);
  localStorage.setItem("@Weekly:userName", result.name);
  localStorage.setItem("@Weekly:userEmail", result.email);
  localStorage.setItem("@Weekly:token", result.token);

  openPage("../home/index.html", "_self");
}

const tryLogin = async () => {
  try {
    const result = await fetch("https://weekly.herokuapp.com/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
