import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Sales from "./components/Sales/Sales";
import AggressionAnalysis from "./components/AggressionAnalysis/AggressionAnalysis";
import Introduction from "./components/Introduction/Introduction";
import GameDetail from "./components/GameDetail/GameDetail";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<Introduction />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/aggression-analysis" element={<AggressionAnalysis />} />
          <Route path="/game/:gameId" element={<GameDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
