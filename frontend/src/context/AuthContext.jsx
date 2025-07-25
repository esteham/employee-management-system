// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null means not logged in

  // 🔁 On first load, check localStorage for saved user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore user from localStorage
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Save to localStorage
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost/IsDB_WDPF_CGNT-M_64/PROJECTs/REACT/employee-management-system/backend/api/auth/logout.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        localStorage.removeItem("user"); // Clear from localStorage
        console.log(data.message);
      } else {
        console.error("Logout failed:", data.message);
      }

    } catch (error) {
      console.error("Logout request error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


/**==========
 * Use Axios
 ============*/
// // src/context/AuthContext.js
// import React, { createContext, useContext, useState } from "react";
// import axios from "axios"; // axios import করতে হবে

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // null means not logged in

//   const login = (userData) => {
//     setUser(userData); // example: { username: 'GPT', role: 'admin' }
//   };

//   const logout = async () => {
//     try {
//       await axios.post(
//         "http://localhost/your-backend-path/logout.php", // ✅ তোমার backend logout.php path দাও
//         {},
//         {
//           withCredentials: true, // cookie পাঠানোর জন্য
//         }
//       );

//       setUser(null); // Session destroy হলে local user state clear
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
