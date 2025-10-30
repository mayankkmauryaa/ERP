"use client";
import { useParams } from "next/navigation";
import PayrollDetailPage from "../../pages/Payroll/PayrollDetailPage";

export default function Page() {
    const params = useParams();
  return <PayrollDetailPage payrollId={params.id as string} />;
}
