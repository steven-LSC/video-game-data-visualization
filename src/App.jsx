import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Sales from "./components/Sales/Sales";
import AggressionAnalysis from "./components/AggressionAnalysis/AggressionAnalysis";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/sales" replace />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/aggression-analysis" element={<AggressionAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
