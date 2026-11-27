import { useState } from "react";
import API from "../api";

function AIAssistant() {
    const role = localStorage.getItem("role") || "citizen";
    const promptsByRole = {
        citizen: ["What is the status of my complaints?", "How do I report a pothole?", "How will I get updates?"],
        officer: ["Summarize my assigned workload", "Show my in-progress complaints", "How do I resolve a complaint?"],
        admin: ["Give me the complaint overview", "How many officers and citizens are active?", "How should I assign a new complaint?"]
    };

    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([
        {
            sender: "ai",
            text: `Hello! I’m your Fixora assistant for your ${role} account. ${role === "admin" ? "I can summarize cases and help manage staff and citizen accounts." : role === "officer" ? "I can summarize your assigned work and help with complaint updates and resolution." : "I can help track your reports, explain status updates, and guide you through submitting an issue."}`
        }
    ]);
    const [loading, setLoading] = useState(false);

    const askAI = async (e) => {
        e?.preventDefault();

        if (!message.trim() || loading) {
            return;
        }

        const userMsg = message.trim();
        setMessage("");

        setChatHistory((prev) => [
            ...prev,
            { sender: "user", text: userMsg }
        ]);

        try {
            setLoading(true);

            const result = await API.post("/ai/assistant/", {
                message: userMsg
            });

            setChatHistory((prev) => [
                ...prev,
                { sender: "ai", text: result.data.response }
            ]);

        } catch (error) {
            setChatHistory((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: "Sorry, I am currently unable to process your request. Please ensure you are logged in and try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const quickQueries = promptsByRole[role] || promptsByRole.citizen;

    return (
        <div className="container py-5">

            <div className="row justify-content-center">

                <div className="col-lg-8">

                    <div className="card shadow-sm border-0">

                        <div className="card-header bg-success text-white py-3">
                            <h4 className="fw-bold mb-0">
                                <i className="bi bi-stars me-2"></i>
                                Fixora AI Assistant
                            </h4>
                            <small className="opacity-75">
                                Guidance and account-scoped civic service support
                            </small>
                        </div>

                        <div
                            className="card-body p-4"
                            style={{
                                maxHeight: "480px",
                                overflowY: "auto",
                                background: "#f8f9fa"
                            }}
                        >
                            {chatHistory.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`d-flex mb-3 ${
                                        msg.sender === "user"
                                            ? "justify-content-end"
                                            : "justify-content-start"
                                    }`}
                                >
                                    {msg.sender === "ai" && (
                                        <div
                                            className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                            style={{ width: "36px", height: "36px" }}
                                        >
                                            <i className="bi bi-robot"></i>
                                        </div>
                                    )}

                                     <div
                                        className={
                                            msg.sender === "user"
                                                ? "chat-bubble-user"
                                                : "chat-bubble-ai"
                                        }
                                        style={{
                                            maxWidth: "80%",
                                            whiteSpace: "pre-wrap"
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="d-flex align-items-center mb-3">
                                    <div className="chat-typing-indicator me-2">
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                    </div>
                                    <small className="text-muted fw-semibold">Fixora AI is analyzing...</small>
                                </div>
                            )}
                        </div>

                        <div className="card-footer bg-white p-3 border-top">

                            <div className="mb-2 d-flex flex-wrap gap-2">
                                <small className="text-muted w-100 mb-1 fw-semibold">
                                    <i className="bi bi-lightbulb me-1 text-warning"></i>
                                    Suggested inquiries:
                                </small>
                                {quickQueries.map((q, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="quick-chip-btn"
                                        onClick={() => {
                                            setMessage(q);
                                        }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={askAI} className="d-flex gap-2 mt-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={role === "admin" ? "Ask about complaints, staff, or citizen accounts..." : role === "officer" ? "Ask about your assigned complaints or field work..." : "Ask about your complaint or how to report an issue..."}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-success btn-shimmer px-4"
                                    disabled={loading || !message.trim()}
                                >
                                    <i className="bi bi-send-fill me-1"></i>
                                    Send
                                </button>
                            </form>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AIAssistant;

