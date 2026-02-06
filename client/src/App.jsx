// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PresenceManagement from "./comp/PresenceManagement.jsx";
import Gestion_compte from "./comp/Gestioncompte.jsx";
import WorkshopRegistrations from "./comp/WorkshopRegistrations.jsx";
import Resources from "./comp/Resources.jsx";
import LiveStream from "./pages/LiveStream.jsx";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/presence" element={<PresenceManagement />} />
          <Route path="/users" element={<Gestion_compte />} />
          <Route path="/workshop-registrations" element={<WorkshopRegistrations />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/live" element={<LiveStream />} />
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;