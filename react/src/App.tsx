import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import DashboardLayout from './layouts/dashboard-layout.tsx';
import SubAccount from './layouts/sub-account.tsx';
import Broadcast from './layouts/broadcast.tsx';
import Deposit from './layouts/deposit.tsx';
import MailboxConfiguration from './layouts/mailbox-configuration.tsx';
import Info from './layouts/info.tsx';
import DomainSetup from './layouts/domain-setup.tsx';
import Aliases from './layouts/aliases.tsx';
import Help from './layouts/help.tsx';
import MailboxUsers from './layouts/mailbox-users.tsx';
import DashboardTransaksi from './layouts/dashboard-transaksi.tsx';


function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<DashboardLayout />}>

        <Route index element={<DashboardTransaksi />} />
        <Route path="info" element={<Info />} />
        <Route path="domain-setup" element={<DomainSetup />} />
        <Route path="mailbox-users" element={<MailboxUsers />} />
        <Route path="aliases" element={<Aliases />} />
        <Route path="help" element={<Help />} />

        {/* Bagian lain di dashboard tapi bukan bagian layout Dashboard */}
        <Route path="sub-account" element={<SubAccount />} />
        <Route path="broadcast" element={<Broadcast />} />
        <Route path="deposit" element={<Deposit />} />
        <Route path="mailbox-config" element={<MailboxConfiguration />} />
      </Route>
    </Routes>
</BrowserRouter>  
    </>
  )
}

export default App
