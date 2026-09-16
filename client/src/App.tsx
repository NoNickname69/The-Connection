import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Host } from "./pages/Host";
import { Join } from "./pages/Join";
import { Screen } from "./pages/Screen";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host" element={<Host />} />
        <Route path="/join" element={<Join />} />
        <Route path="/screen" element={<Screen />} />
      </Routes>
    </BrowserRouter>
  );
}
