import { Navigate, Route, Routes } from "react-router-dom";
import EmployeesPage from "./features/employees/pages/EmployeesPage";
import EmployeeDetailsPage from "./features/employees/pages/EmployeeDetailsPage";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Routes>
    </div>
  );
}
