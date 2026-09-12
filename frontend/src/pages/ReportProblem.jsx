import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function ReportProblem() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        category: "",
        title: "",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        priority: "medium"
    });

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState("");
    const [aiNotice, setAiNotice] = useState(null);

    const localClassify = (text) => {
        const t = (text || "").toLowerCase();
        const categories = {
            pothole: [
                "pothole", "potholes", "road damage", "road broken", "road hole", "damaged road",
                "road", "roads", "crater", "tarmac", "asphalt", "bump", "speed breaker",
                "highway", "street broken", "pit", "crack", "footpath", "sidewalk", "divider"
            ],
            street_light: [
                "street light", "lamp", "light not working", "dark road", "street lamp",
                "light", "lights", "dark", "darkness", "streetlight", "bulb", "pole", "wire",
                "electric pole", "illumination", "night", "no light", "broken light", "tube light"
            ],
            garbage: [
                "garbage", "waste", "trash", "dustbin", "dump",
                "litter", "debris", "smell", "stink", "rotting", "filth", "cleanliness",
                "plastics", "rubbish", "refuse", "bin", "waste dump", "overflowing garbage"
            ],
            water_leakage: [
                "water leakage", "water pipe", "pipe broken", "water leaking",
                "water", "leak", "leaking", "leakage", "pipeline", "pipe", "tap",
                "drinking water", "burst", "water supply", "tanker", "overflow", "pipeline burst"
            ],
            drainage: [
                "drain", "drainage", "sewage", "blocked drain",
                "gutter", "manhole", "clogged", "overflowing drain", "stagnant water",
                "mosquito", "sewer", "sewerage", "foul smell", "gutters", "open drain"
            ],
            traffic_signal: [
                "traffic signal", "traffic light", "signal not working",
                "traffic", "signal", "signals", "red light", "zebra crossing", "junction",
                "congestion", "signboard", "blinker", "traffic jam", "traffic light broken"
            ],
            public_property: [
                "bench", "park", "public property", "government building",
                "garden", "playground", "fence", "bus stop", "shelter", "wall",
                "public toilet", "monument", "statue", "railing", "boundary", "community hall"
            ]
        };

        const departments = {
            pothole: "Roads",
            street_light: "Electricity",
            garbage: "Sanitation",
            water_leakage: "Water Supply",
            drainage: "Sanitation",
            traffic_signal: "Traffic",
            public_property: "Public Works",
            other: "General"
        };

        let bestCat = "other";
        let maxScore = 0;

        for (const [cat, keywords] of Object.entries(categories)) {
            let score = 0;
            for (const kw of keywords) {
                if (t.includes(kw)) {
                    score += kw.includes(" ") ? 2 : 1;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestCat = cat;
            }
        }

        const criticalKeywords = [
            "urgent", "emergency", "danger", "dangerous", "hazard", "hazardous",
            "life threatening", "accident", "fatal", "severe", "risk", "fire",
            "sparking", "exposed wire", "electrocution", "collapsed", "sinkhole"
        ];
        const highKeywords = [
            "huge", "big", "broken", "overflowing", "heavy", "burst",
            "blocked", "deep", "damage", "foul", "major", "serious"
        ];
        const lowKeywords = ["minor", "small", "routine", "paint", "cleaning", "slight"];

        let priority = "medium";
        if (criticalKeywords.some((k) => t.includes(k))) {
            priority = "critical";
        } else if (highKeywords.some((k) => t.includes(k)) || ["pothole", "traffic_signal", "water_leakage"].includes(bestCat)) {
            priority = "high";
        } else if (lowKeywords.some((k) => t.includes(k))) {
            priority = "low";
        }

        return {
            category: bestCat,
            priority,
            department: departments[bestCat] || "General"
        };
    };

    const classifyComplaint = async () => {
        const fullText = `${form.title} ${form.description}`.trim();
        if (!fullText) {
            alert("Please enter a title or description first for AI analysis.");
            return;
        }

        try {
            setAiLoading(true);
            let resultData = null;

            try {
                const response = await API.post("/ai/classify/", {
                    text: fullText
                });
                if (response.data && response.data.category) {
                    resultData = response.data;
                }
            } catch (apiErr) {
                console.warn("Backend AI classification endpoint error, using smart client NLP engine:", apiErr);
            }

            if (!resultData || !resultData.category) {
                resultData = localClassify(fullText);
            }

            const categoryLabels = {
                pothole: "Road Pothole / Street Damage",
                street_light: "Faulty Street Light",
                garbage: "Garbage / Waste Dump Overflow",
                water_leakage: "Water Supply Leakage / Pipe Burst",
                drainage: "Open / Blocked Drainage",
                traffic_signal: "Traffic Signal Malfunction",
                public_property: "Public Property Damage",
                other: "Other Civic Issue"
            };

            const detectedCategory = resultData.category || "other";
            const detectedPriority = resultData.priority || "medium";
            const detectedDept = resultData.department || "General";
            const catLabel = categoryLabels[detectedCategory] || detectedCategory;

            setForm((prev) => ({
                ...prev,
                category: detectedCategory,
                priority: detectedPriority
            }));

            setAiNotice({
                categoryName: catLabel,
                category: detectedCategory,
                priority: detectedPriority,
                department: detectedDept
            });

            alert(
                `✨ AI Auto-Classification Complete:\n• Category: ${catLabel}\n• Priority: ${detectedPriority.toUpperCase()}\n• Department: ${detectedDept}`
            );
        } catch (error) {
            const safe = localClassify(fullText);
            setForm((prev) => ({
                ...prev,
                category: safe.category,
                priority: safe.priority
            }));
            setAiNotice({
                categoryName: safe.category,
                category: safe.category,
                priority: safe.priority,
                department: safe.department
            });
            alert(
                `✨ AI Auto-Classification Applied:\n• Category: ${safe.category}\n• Priority: ${safe.priority.toUpperCase()}\n• Department: ${safe.department}`
            );
        } finally {
            setAiLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handlePrioritySelect = (priorityVal) => {
        setForm({
            ...form,
            priority: priorityVal
        });
    };

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lon = position.coords.longitude.toFixed(6);

                setForm((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lon
                }));

                // Auto-fill human-readable Street Address via Reverse Geocoding
                try {
                    const geoRes = await API.get(`/complaints/reverse-geocode/?lat=${lat}&lon=${lon}`);
                    if (geoRes.data?.location) {
                        setForm((prev) => ({
                            ...prev,
                            latitude: lat,
                            longitude: lon,
                            location: geoRes.data.location
                        }));
                    }
                } catch (geoErr) {
                    console.warn("Reverse geocoding note:", geoErr);
                    setForm((prev) => ({
                        ...prev,
                        location: prev.location || `GPS Location (${lat}, ${lon})`
                    }));
                } finally {
                    setLocating(false);
                }
            },
            () => {
                setError("Unable to retrieve location automatically. Please enter coordinates or address manually.");
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.category) {
            setError("Please select a problem category.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            data.append("category", form.category);
            data.append("title", form.title);
            data.append("description", form.description);
            data.append("location", form.location);
            data.append("latitude", form.latitude);
            data.append("longitude", form.longitude);
            data.append("priority", form.priority);

            if (image) {
                data.append("image", image);
            }

            const response = await API.post("/complaints/", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            alert(
                `🎉 Grievance filed successfully!\nComplaint ID: ${response.data.complaint_id}\nTrack your resolution anytime in the portal.`
            );

            navigate("/complaints");

        } catch (error) {
            if (error.response?.status === 401) {
                setError("Your login session has expired. Please log in again to submit your complaint.");
                alert("Your session has expired. Please log in again.");
                navigate("/login");
                return;
            }
            setError(
                typeof error.response?.data === "object"
                    ? JSON.stringify(error.response.data)
                    : "Unable to submit complaint. Please check your inputs."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 page-enter">
            <div className="row justify-content-center">
                <div className="col-lg-8">

                    <div className="card auth-card shadow-sm border-0">
                        <div className="auth-header text-start py-4 px-4 px-md-5">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h3 className="fw-bold mb-1 text-white">
                                        <i className="bi bi-megaphone me-2"></i>
                                        Report a Civic Problem
                                    </h3>
                                    <p className="small mb-0 text-white-50">
                                        Fill details with photo & GPS. Municipal officials are notified instantly.
                                    </p>
                                </div>
                                <span className="badge bg-white text-success px-3 py-2 rounded-pill shadow-sm d-none d-md-inline-block">
                                    <i className="bi bi-shield-check me-1"></i> SLA Protected
                                </span>
                            </div>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            {error && (
                                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
                                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                {/* 1. Category */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-dark">
                                        Problem Category <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Choose Civic Category...</option>
                                        <option value="pothole">Road Pothole / Street Damage</option>
                                        <option value="street_light">Faulty Street Light</option>
                                        <option value="garbage">Garbage / Waste Dump Overflow</option>
                                        <option value="water_leakage">Water Supply Leakage / Pipe Burst</option>
                                        <option value="drainage">Open / Blocked Drainage</option>
                                        <option value="traffic_signal">Traffic Signal Malfunction</option>
                                        <option value="public_property">Public Property Damage</option>
                                        <option value="other">Other Civic Issue</option>
                                    </select>
                                </div>

                                {/* 2. Title */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-dark">
                                        Grievance Title <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-icon-wrapper">
                                        <i className="bi bi-card-heading"></i>
                                        <input
                                            type="text"
                                            name="title"
                                            className="form-control"
                                            placeholder="e.g. Hazardous deep pothole near bus terminal"
                                            value={form.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* 3. Description & AI Trigger */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label fw-semibold text-dark mb-0">
                                            Description <span className="text-danger">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-sm btn-shimmer rounded-pill px-3 py-1"
                                            onClick={classifyComplaint}
                                            disabled={aiLoading}
                                        >
                                            <i className={`bi bi-stars me-1 text-warning ${aiLoading ? "d-inline-block" : ""}`}
                                               style={{ animation: aiLoading ? "aiSpinGlow 1.2s linear infinite" : undefined }}></i>
                                            {aiLoading ? "Analyzing..." : "Auto-Detect with AI"}
                                        </button>
                                    </div>
                                    <textarea
                                        name="description"
                                        className="form-control"
                                        rows="4"
                                        placeholder="Describe the severity, nearby landmarks, or risks to pedestrians..."
                                        value={form.description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>

                                    {aiNotice && (
                                        <div className="alert alert-success py-2 px-3 small d-flex align-items-center justify-content-between mt-2 mb-0 rounded-3 shadow-sm border border-success border-opacity-25"
                                             style={{ animation: "fadeInUp 0.3s ease forwards" }}>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-robot text-success fs-5"></i>
                                                <div>
                                                    <strong>AI Classification:</strong>
                                                    <span className="ms-2 badge bg-success">{aiNotice.categoryName}</span>
                                                    <span className={`ms-1 badge ${aiNotice.priority === 'critical' ? 'bg-danger' : aiNotice.priority === 'high' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                                        {aiNotice.priority?.toUpperCase()} Priority
                                                    </span>
                                                    <span className="ms-1 text-muted">({aiNotice.department} Department)</span>
                                                </div>
                                            </div>
                                            <button type="button" className="btn-close btn-close-sm" onClick={() => setAiNotice(null)}></button>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Priority Pills */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-dark mb-2">
                                        Select Priority Level
                                    </label>
                                    <div className="priority-pill-grid">
                                        <div
                                            className={`priority-pill-item ${form.priority === "low" ? "active-low" : ""}`}
                                            onClick={() => handlePrioritySelect("low")}
                                        >
                                            <i className="bi bi-arrow-down-circle me-1 text-info"></i>
                                            Low
                                        </div>
                                        <div
                                            className={`priority-pill-item ${form.priority === "medium" ? "active-medium" : ""}`}
                                            onClick={() => handlePrioritySelect("medium")}
                                        >
                                            <i className="bi bi-dash-circle me-1 text-warning"></i>
                                            Medium
                                        </div>
                                        <div
                                            className={`priority-pill-item ${form.priority === "high" ? "active-high" : ""}`}
                                            onClick={() => handlePrioritySelect("high")}
                                        >
                                            <i className="bi bi-arrow-up-circle me-1 text-danger"></i>
                                            High
                                        </div>
                                        <div
                                            className={`priority-pill-item ${form.priority === "critical" ? "active-critical" : ""}`}
                                            onClick={() => handlePrioritySelect("critical")}
                                        >
                                            <i className="bi bi-exclamation-octagon-fill me-1 text-danger"></i>
                                            Critical
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Location & Geotagging */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                                        <label className="form-label fw-semibold text-dark mb-0">
                                            Location / Street Address <span className="text-danger">*</span>
                                        </label>

                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-sm btn-shimmer rounded-pill px-3 py-1"
                                            onClick={getLocation}
                                            disabled={locating}
                                            title="Click to auto-fill your exact location and coordinates via GPS"
                                        >
                                            <span className="pulse-radar-dot me-1"></span>
                                            {locating ? "Detecting Street Address & GPS..." : "📍 Auto-Detect My Location"}
                                        </button>
                                    </div>

                                    <div className="input-icon-wrapper mb-3">
                                        <i className="bi bi-geo-alt"></i>
                                        <input
                                            type="text"
                                            name="location"
                                            className="form-control"
                                            placeholder="Click 'Auto-Detect' or enter: e.g. Gandhi Road, Tirupati"
                                            value={form.location}
                                            onChange={handleChange}
                                            onClick={() => {
                                                if (!form.location && !locating) {
                                                    getLocation();
                                                }
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="row g-2 mb-2">
                                        <div className="col-md-6">
                                            <input
                                                type="text"
                                                name="latitude"
                                                className="form-control form-control-sm bg-light"
                                                placeholder="Latitude (auto-filled by GPS)"
                                                value={form.latitude}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <input
                                                type="text"
                                                name="longitude"
                                                className="form-control form-control-sm bg-light"
                                                placeholder="Longitude (auto-filled by GPS)"
                                                value={form.longitude}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {locating && (
                                        <div className="d-flex align-items-center gap-2 mt-1 text-success small">
                                            <span className="spinner-border spinner-border-sm"></span>
                                            <span>Locating GPS satellite & resolving street address...</span>
                                        </div>
                                    )}
                                </div>

                                {/* 6. Photographic Evidence Dropzone */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-dark">
                                        Attach Photographic Evidence
                                    </label>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleImage}
                                    />

                                    {!imagePreview ? (
                                        <div
                                            className="dropzone-container"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <i className="bi bi-cloud-arrow-up display-5 text-success d-block mb-2"></i>
                                            <span className="fw-semibold text-dark d-block">Click to upload or drag photo here</span>
                                            <small className="text-muted">Supports JPG, PNG, WEBP (Max 10MB)</small>
                                        </div>
                                    ) : (
                                        <div className="position-relative d-inline-block border rounded-3 p-2 bg-light">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="dropzone-preview d-block"
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                                                onClick={removeImage}
                                                title="Remove photo"
                                                style={{ width: "32px", height: "32px", padding: 0 }}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success btn-shimmer w-100 py-3 shadow fw-bold fs-6 mt-3"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Submitting Complaint to Municipal Portal...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send-check-fill me-2"></i>
                                            Submit Complaint
                                        </>
                                    )}
                                </button>

                            </form>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ReportProblem;
