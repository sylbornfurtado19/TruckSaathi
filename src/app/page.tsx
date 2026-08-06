import ClientLayout from '@/components/layout/ClientLayout';
import { DashboardFeature } from '@/features/dashboard/components/DashboardFeature';

export default function HomePage() {
  return (
    <ClientLayout>
      <DashboardFeature />
    </ClientLayout>
  );
}
