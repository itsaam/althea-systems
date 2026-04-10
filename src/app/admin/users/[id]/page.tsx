import { UserDetailView } from "@/components/admin/users/user-detail-view";

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params;
  return <UserDetailView userId={id} />;
}
