// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // Changed to 'Home' with a capital H for convention
import Login from "./pages/login";
import Register from "./pages/register";


const App = () => {


  return (
    <div>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

          {/* Catch-all route for any other path */}
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;