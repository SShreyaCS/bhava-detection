import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import LiveStart from "./pages/LiveStart";
import LiveCapture from "./pages/LiveCapture";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/live" element={<LiveStart />} />
      <Route path="/live/capture" element={<LiveCapture />} />
    </Routes>
  );
}
