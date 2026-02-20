import { Routes, Route, Link } from "react-router-dom";
import ExpertCalendar from "./ExpertCalendar";
import Calendary from "./Calendly.tsx";
import JitsiTest from "./jitsiTest.tsx";

function Home() {
    return (
        <div style={{ padding: "40px" }}>
            <h1>Home Page</h1>
            <Link to="/expert">
                <button style={{ padding: "10px 20px" }}>
                    Go to Expert Calendar
                </button>
            </Link>

            <Link to="/client-calandar">
                <button style={{ padding: "10px 20px" }}>
                    Go to Client Calendar
                </button>
            </Link>
            <Link to="/video-chat">
                <button style={{ padding: "10px 20px" }}>
                    Go to VideoChat
                </button>
            </Link>
        </div>

    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/expert" element={<ExpertCalendar />} />
            <Route path="/calandar" element={<Calendary />} />
            <Route path="/videochat" element={<JitsiTest />} />
        </Routes>
    );
}

export default App;