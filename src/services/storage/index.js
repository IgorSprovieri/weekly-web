const saveUserData = (token, userId, userName, userEmail) => {
  localStorage.setItem("@Weekly:token", token);
  localStorage.setItem("@Weekly:user_id", userId);
  localStorage.setItem("@Weekly:userName", userName);
  localStorage.setItem("@Weekly:userEmail", userEmail);
};

const getUserData = () => {
  const token = localStorage.getItem("@Weekly:token");
  const userId = localStorage.getItem("@Weekly:user_id");
  const userName = localStorage.getItem("@Weekly:userName");
  const userEmail = localStorage.getItem("@Weekly:userEmail");

  return {
    token: token,
    userId: userId,
    userName: userName,
    userEmail: userEmail,
  };
};

const deleteUserData = () => {
  localStorage.removeItem("@Weekly:token");
  localStorage.removeItem("@Weekly:user_id");
  localStorage.removeItem("@Weekly:userName");
  localStorage.removeItem("@Weekly:userEmail");
};
