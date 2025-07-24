// src/api/loginHandler.js
import axios from "axios";

// এই ফাংশন শুধু login API call করবে
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post("http://localhost/IsDB_WDPF_CGNT-M_64/PROJECTs/REACT/employee-management-system/backend/api/auth/login.php", {
      username,
      password,
    });

    return response.data; // success, message
  } catch (error) {
    console.error("Login API Error:", error);
    return { success: false, message: "Something went wrong!" };
  }
};
