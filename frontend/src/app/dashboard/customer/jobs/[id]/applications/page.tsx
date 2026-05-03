import { redirect } from "next/navigation";

export default function CustomerJobApplicationsPage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/customer/jobs/${params.id}`);
}
