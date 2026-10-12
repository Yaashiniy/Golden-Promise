import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import Signup from './pages/Signup.jsx'
import Venues from './pages/Venues.jsx'
import VenueDetail from './pages/VenueDetail.jsx'
import Vendors from './pages/Vendors.jsx'
import VendorCategory from './pages/VendorCategory.jsx'
import VendorDetail from './pages/VendorDetail.jsx'
import OurStory from './pages/OurStory.jsx'
import Community from './pages/Community.jsx'
import Contact from './pages/Contact.jsx'
import VisitUs from './pages/VisitUs.jsx'
import BecomeVendor from './pages/BecomeVendor.jsx'
import BecomeVendorApply from './pages/BecomeVendorApply.jsx'
import VendorLogin from './pages/VendorLogin.jsx'
import VendorStatus from './pages/VendorStatus.jsx'
import Referral from './pages/Referral.jsx'
import Boutique from './pages/Boutique.jsx'
import NotFound from './pages/NotFound.jsx'
import AiChecklistAbout from './pages/AiChecklistAbout.jsx'
import GoldieAiAbout from './pages/GoldieAiAbout.jsx'

import CoupleDashboard from './pages/dashboard/CoupleDashboard.jsx'
import Budget from './pages/dashboard/Budget.jsx'
import Checklist from './pages/dashboard/Checklist.jsx'
import GoldieAi from './pages/dashboard/GoldieAi.jsx'
import Favorites from './pages/dashboard/Favorites.jsx'
import Settings from './pages/dashboard/Settings.jsx'

import VendorDashboard from './pages/vendor/VendorDashboard.jsx'
import VendorProfile from './pages/vendor/VendorProfile.jsx'
import VendorPortfolio from './pages/vendor/VendorPortfolio.jsx'
import VendorApplicationStatus from './pages/vendor/VendorApplicationStatus.jsx'
import VendorSubscription from './pages/vendor/VendorSubscription.jsx'
import VendorSettings from './pages/vendor/VendorSettings.jsx'
import PaymentSuccess from './pages/vendor/PaymentSuccess.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="admin-login" element={<AdminLogin />} />

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="venues" element={<Venues />} />
        <Route path="venues/:slug" element={<VenueDetail />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="vendors/:category" element={<VendorCategory />} />
        <Route path="vendor/:slug" element={<VendorDetail />} />
        <Route path="our-story" element={<OurStory />} />
        <Route path="ai-checklist" element={<AiChecklistAbout />} />
        <Route path="goldie-ai" element={<GoldieAiAbout />} />
        <Route path="community" element={<Community />} />
        <Route path="contact" element={<Contact />} />
        <Route path="visit-us" element={<VisitUs />} />
        <Route path="become-vendor" element={<BecomeVendor />} />
        <Route path="become-vendor/apply" element={<BecomeVendorApply />} />
        <Route path="vendor-login" element={<VendorLogin />} />
        <Route path="vendor-status" element={<VendorStatus />} />
        <Route path="referral" element={<Referral />} />
        <Route path="boutique" element={<Boutique />} />

        <Route path="dashboard" element={<ProtectedRoute roles={['couple']}><CoupleDashboard /></ProtectedRoute>} />
        <Route path="dashboard/budget" element={<ProtectedRoute roles={['couple']}><Budget /></ProtectedRoute>} />
        <Route path="dashboard/checklist" element={<ProtectedRoute roles={['couple']}><Checklist /></ProtectedRoute>} />
        <Route path="dashboard/goldie" element={<ProtectedRoute roles={['couple']}><GoldieAi /></ProtectedRoute>} />
        <Route path="dashboard/favorites" element={<ProtectedRoute roles={['couple']}><Favorites /></ProtectedRoute>} />
        <Route path="dashboard/settings" element={<ProtectedRoute roles={['couple']}><Settings /></ProtectedRoute>} />

        <Route path="vendor-portal" element={<ProtectedRoute roles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
        <Route path="vendor-portal/profile" element={<ProtectedRoute roles={['vendor']}><VendorProfile /></ProtectedRoute>} />
        <Route path="vendor-portal/portfolio" element={<ProtectedRoute roles={['vendor']}><VendorPortfolio /></ProtectedRoute>} />
        <Route path="vendor-portal/application" element={<ProtectedRoute roles={['vendor']}><VendorApplicationStatus /></ProtectedRoute>} />
        <Route path="vendor-portal/subscription" element={<ProtectedRoute roles={['vendor']}><VendorSubscription /></ProtectedRoute>} />
        <Route path="vendor-portal/settings" element={<ProtectedRoute roles={['vendor']}><VendorSettings /></ProtectedRoute>} />
        <Route path="vendor-portal/payment-success" element={<PaymentSuccess />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
