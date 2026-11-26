import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
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

                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/register" element={<Register />} />

                <Route path="/track" element={<TrackComplaint />} />

                <Route
                    path="/track/:complaintId"
                    element={<PublicComplaintTracking />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/report"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
                            <ReportProblem />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/complaints"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
                            <MyComplaints />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/complaints/:id"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
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
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/complaints/:id"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminComplaintDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer"
                    element={
                        <ProtectedRoute allowedRoles={["officer"]}>
                            <OfficerDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/officer/complaints/:id"
                    element={
                        <ProtectedRoute allowedRoles={["officer"]}>
                            <OfficerComplaintDetails />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
