import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrackComplaint from "./pages/TrackComplaint";
import PublicComplaintTracking from "./pages/PublicComplaintTracking";
import Dashboard from "./pages/Dashboard";
import ReportProblem from "./pages/ReportProblem";
import MyComplaints from "./pages/MyComplaints";
import ComplaintDetails from "./pages/ComplaintDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaintDetails from "./pages/AdminComplaintDetails";
import Notifications from "./pages/Notifications";
import AIAssistant from "./pages/AIAssistant";
import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerComplaintDetails from "./pages/OfficerComplaintDetails";

function App() {
    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/track" element={<TrackComplaint />} />

                <Route
                    path="/track/:complaintId"
                    element={<PublicComplaintTracking />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/report"
                    element={
                        <ProtectedRoute>
                            <ReportProblem />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/complaints"
                    element={
                        <ProtectedRoute>
                            <MyComplaints />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/complaints/:id"
                    element={
                        <ProtectedRoute>
                            <ComplaintDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/ai-assistant"
                    element={
                        <ProtectedRoute>
                            <AIAssistant />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/complaints/:id"
                    element={
                        <ProtectedRoute>
                            <AdminComplaintDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer"
                    element={
                        <ProtectedRoute>
                            <OfficerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/complaints/:id"
                    element={
                        <ProtectedRoute>
                            <OfficerComplaintDetails />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;