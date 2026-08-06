import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { SavedReports } from './pages/SavedReports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research-report" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/saved-reports" element={<SavedReports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
