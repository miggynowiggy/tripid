import { TripidDashboard } from '@/components/tripid-dashboard';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider defaultOpen={true}>
      <TripidDashboard />
    </SidebarProvider>
  );
}
