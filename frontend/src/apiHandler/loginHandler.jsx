// src/api/loginHandler.js
import axios from "axios";

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post("http://localhost/IsDB_WDPF_CGNT-M_64/PROJECTs/REACT/employee-management-system/backend/api/auth/login.php", {
      username,
      password,
    },
    {
      withCredentials: true,
      header  :{
        "Content-Type": "application/json",
      },
    }
  
  );

    return response.data; // success, message
  } catch (error) {
    console.error("Login API Error:", error);
    return { success: false, message: "Something went wrong!" };
  }
};