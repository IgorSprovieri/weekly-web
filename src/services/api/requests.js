const baseUrl = "https://api.weekly.ispapps.com";

const tryRegister = async (userName, email, password) => {
  try {
    const result = await fetch(`${baseUrl}/user`, {
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

const tryLogin = async (email, password) => {
  try {
    const result = await fetch(`${baseUrl}/login`, {
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

const tryForgotPassword = async (email) => {
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

const tryResetPassword = async (token, email, password) => {
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

const tryGetAppColors = async () => {
  try {
    const result = await fetch(`${baseUrl}/colors`);
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

    const result = await fetch(`${baseUrl}/user`, {
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
      `${baseUrl}/task?initialDate=${initialDate}T00%3A00%3A00.000Z&finalDate=${finalDate}T23%3A59%3A59.000Z`,
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

    const result = await fetch(`${baseUrl}/task`, {
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

    const result = await fetch(`${baseUrl}/task/${taskId}`, {
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

    const result = await fetch(`${baseUrl}/task/${taskId}`, {
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
