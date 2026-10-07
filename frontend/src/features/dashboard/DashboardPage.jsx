import AppHeader from '../../components/AppHeader'
import AlertFormDrawer from '../alerts/AlertFormDrawer'
import AlertsSection from '../alerts/AlertsSection'
import ToastStack from '../notifications/ToastStack'
import PriceGrid from '../prices/PriceGrid'

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-10">
        <PriceGrid />
        <AlertsSection />
      </main>
      <AlertFormDrawer />
      <ToastStack />
    </div>
  )
}
