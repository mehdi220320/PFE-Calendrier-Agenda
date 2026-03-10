
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from "./pages/home/HomePage.tsx";
import ExpertsList from "./pages/experts/ExpertsList.tsx";
import ExpertView from "./pages/experts/ExpertView.tsx";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/accueil" element={<HomePage />} />
                <Route path="/experts" element={<ExpertsList />} />
                <Route path="/expert/:id" element={<ExpertView />} />

                <Route path="/" element={<Navigate to="/accueil" replace />} />
            </Routes>
        </Router>
    );
}

export default App;