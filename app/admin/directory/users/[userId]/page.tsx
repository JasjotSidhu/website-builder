import { redirect } from "next/navigation";

export default function AdminDirectoryUserRedirect({ params }: { params: { userId: string } }) {
  redirect(`/admin/users/${params.userId}`);
}
