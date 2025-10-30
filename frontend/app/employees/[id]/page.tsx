"use client";
import { useParams } from "next/navigation";
import EmployeeDetailPage from "../../pages/Employees/EmployeeDetailPage";

export default function Page() {
    const params = useParams();
  return <EmployeeDetailPage employeeId={params.id as string} />;
}
