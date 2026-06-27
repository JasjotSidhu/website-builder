import { redirect } from "next/navigation";

export default function AdminDirectoryWebsiteRedirect({ params }: { params: { websiteId: string } }) {
  redirect(`/admin/websites/${params.websiteId}`);
}
