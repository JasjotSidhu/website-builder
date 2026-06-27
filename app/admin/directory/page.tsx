import { redirect } from "next/navigation";

export default function AdminDirectoryRedirect({
  searchParams,
}: {
  searchParams?: { q?: string; view?: string };
}) {
  const base = searchParams?.view === "websites" ? "/admin/websites" : "/admin/users";
  const params = new URLSearchParams();
  if (searchParams?.q) {
    params.set("q", searchParams.q);
  }
  const query = params.toString();
  redirect(query ? `${base}?${query}` : base);
}
