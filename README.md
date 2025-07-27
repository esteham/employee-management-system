This project is ideal for learning full-stack development using modern technologies.
# Employee Management System

A full-featured employee management platform built with React (frontend) and PHP (backend).  
It helps organizations manage employees, HR activities, payroll, groups, and departments efficiently.

A web-based application designed to manage employee data efficiently. Built with:

    Frontend: React (Vite, JSX, Tailwind)

    Backend: PHP (with PDO) + MySQL

    Features:

        Admin authentication

        Create, Read, Update, Delete (CRUD) for employees

        Role-based access control

        Responsive UI

        Real-time updates with React Hooks
---

## Features

- **Authentication:** Secure login/logout with session and cookie support.
- **Admin Dashboard:** Quick access to employee, group, department, payroll, and settings management.
- **Employee Management:** Register, view, and manage employee details.
- **Group Management:** Create, edit, and delete employee groups.
- **Department Management:** Manage departments and assign employees.
- **Payroll:** Generate and view payrolls.
- **Responsive UI:** Built with React Bootstrap for modern look and feel.
- **Role-based Access:** Admin, HR, and Employee panels.

---

## File Structure

```
employee-management-system/
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── assets/
│       │   └── css/
│       │       └── AdminDashboard.css
│       ├── components/
│       │   └── Home.jsx
│       │   └── Admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── Sidebar.jsx
│       │       ├── DashboardContent.jsx
│       │       ├── EmployeesContent.jsx
│       │       ├── GroupsContent.jsx
│       │       ├── PayrollContent.jsx
│       │       ├── SettingsContent.jsx
│       │       ├── DepartmentsContent.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── Employee/
│       │   │   └── EmployeeRegistrationModal.jsx
│       │   ├── Groups/
│       │   │   ├── GroupCreateModal.jsx
│       │   │   └── GroupEditModal.jsx
│       │   ├── Departments/
│       │   │   ├── DepartmentCreateModal.jsx
│       │   │   └── DepartmentEditModal.jsx
│       │   ├── Payroll/
│       │   │   └── ViewPayroll.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.js
├── backend/
│   └── api/
│       ├── auth/
│       │   ├── login.php
│       │   ├── logout.php
│       │   └── check_session.php
│       ├── groups/
│       │   ├── view.php
│       │   └── delete.php
│       ├── department/
│       │   ├── fetctDepartment.php
│       │   └── delete.php
│       └── payroll/
│           └── view.php
├── package.json
├── README.md
├── .gitignore
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js & npm
- PHP & MySQL
- Vite (for React frontend)

### Installation

1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/employee-management-system.git
   cd employee-management-system
   ```

2. **Install frontend dependencies:**
   ```
   cd frontend
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in `frontend/` and set:
     ```
     VITE_API_URL=http://localhost/employee-management-system/
     ```

4. **Setup backend:**
   - Place backend files in your PHP server directory.
   - Import the database SQL file (if provided).

5. **Run frontend:**
   ```
   npm run dev
   ```

6. **Access the app:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost/employee-management-system/backend/api/](http://localhost/employee-management-system/backend/api/)

---

## Usage

- **Login:** Use your credentials to log in.
- **Admin Panel:** Manage employees, groups, departments, payroll, and settings.
- **Sidebar:** Navigate between different sections.
- **Modals:** Add/edit employees, groups, departments via modal forms.

---

## Technologies Used

- **Frontend:** React, React Bootstrap, Axios, Vite
- **Backend:** PHP, MySQL
- **Icons:** react-bootstrap-icons

---

## Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.

---

## License

MIT

---

## Contact

For any queries, contact [your-email@example.com](mailto:your-email@example.com)