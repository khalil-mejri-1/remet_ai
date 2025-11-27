// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx"; // Changed to 'Home' with a capital H for convention


const App = () => {


  return (
    <div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Catch-all route for any other path */}
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;