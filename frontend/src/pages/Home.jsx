import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function AnimatedMetric({ end, suffix = "", prefix = "", label, delay = 0 }) {
    const [value, setValue] = useState(0);
    const [started, setStarted] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return undefined;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setStarted(true);
                observer.disconnect();
            }
        }, { threshold: 0.35 });

        observer.observe(card);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return undefined;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let frame;
        const wait = window.setTimeout(() => {
            if (prefersReducedMotion) {
                setValue(end);
                return;
            }

            const duration = 1500;
            const startAt = performance.now();
            const animate = (now) => {
                const progress = Math.min((now - startAt) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4);
                const precision = Number.isInteger(end) ? 1 : 10;
                setValue(Math.round(end * precision * eased) / precision);
                if (progress < 1) frame = requestAnimationFrame(animate);
            };

            frame = requestAnimationFrame(animate);
        }, delay);

        return () => {
            window.clearTimeout(wait);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [delay, end, started]);

    return (
        <div
            ref={cardRef}
            className={`metric-card${started ? " metric-card-started" : ""}`}
            style={{ "--metric-delay": `${delay}ms` }}
        >
            <h3 className="fw-bold text-success mb-1" aria-label={`${prefix}${end.toLocaleString()}${suffix}`}>
                {prefix}{value.toLocaleString()}{suffix}
            </h3>
            <small className="text-muted fw-semibold">{label}</small>
        </div>
    );
}

function RevealOnScroll({ children, delay = 0, className = "" }) {
    const [visible, setVisible] = useState(false);
    const itemRef = useRef(null);

    useEffect(() => {
        const item = itemRef.current;
        if (!item) return undefined;
        if (!("IntersectionObserver" in window)) {
            setVisible(true);
            return undefined;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.18 });

        observer.observe(item);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={itemRef}
            className={`home-reveal${visible ? " is-visible" : ""} ${className}`.trim()}
            style={{ "--reveal-delay": `${delay}ms` }}
        >
            {children}
        </div>
    );
}

function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero-section position-relative overflow-hidden">
                <div className="hero-orb hero-orb-1"></div>
                <div className="hero-orb hero-orb-2"></div>

                <div className="container text-center position-relative" style={{ zIndex: 2 }}>
                    
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill hero-badge">
                        <span className="badge-pulse-dot"></span>
                        <small className="fw-semibold">AI-Powered Smart Municipal Redressal</small>
                    </div>

                    <h1 className="display-4 fw-bold hero-title">
                        Fixora
                    </h1>

                    <p className="lead hero-lead mx-auto mb-4" style={{ maxWidth: "660px" }}>
                        Report civic problems, monitor real-time SLA resolutions, and help make your city cleaner, safer, and better through transparent digital governance.
                    </p>

                    {/* Floating micro-badges */}
                    <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
                        <div className="floating-hero-chip">
                            <i className="bi bi-shield-check text-success fs-5"></i>
                            <span className="small fw-semibold text-dark">98.6% SLA Compliance</span>
                        </div>
                        <div className="floating-hero-chip reverse">
                            <i className="bi bi-geo-alt-fill text-success fs-5"></i>
                            <span className="small fw-semibold text-dark">Geo-Tagged Live Dispatch</span>
                        </div>
                        <div className="floating-hero-chip">
                            <i className="bi bi-stars text-warning fs-5"></i>
                            <span className="small fw-semibold text-dark">AI Category Detection</span>
                        </div>
                    </div>

                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                        <Link
                            to="/report"
                            className="btn btn-success btn-lg px-4 shadow-sm btn-animated btn-shimmer"
                        >
                            <i className="bi bi-megaphone me-2"></i>
                            Report a Problem
                        </Link>

                        <Link
                            to="/track"
                            className="btn btn-outline-success btn-lg px-4 btn-animated btn-shimmer"
                        >
                            <i className="bi bi-search me-2"></i>
                            Track Complaint
                        </Link>
                    </div>
                </div>
            </section>

            {/* Municipal Impact Metric Counters Bar */}
            <section className="container my-5">
                <div className="row g-3 text-center">
                    <div className="col-6 col-md-3"><AnimatedMetric end={12500} suffix="+" label="Issues Resolved" delay={0} /></div>
                    <div className="col-6 col-md-3"><AnimatedMetric end={98.4} suffix="%" label="SLA Adherence" delay={350} /></div>
                    <div className="col-6 col-md-3"><AnimatedMetric end={36} prefix="< " suffix=" Hrs" label="Avg. Resolution Time" delay={700} /></div>
                    <div className="col-6 col-md-3"><AnimatedMetric end={100} suffix="%" label="Public Transparency" delay={1050} /></div>
                </div>
            </section>

            {/* Core Feature Cards */}
            <section className="container py-4">
                <div className="text-center mb-5">
                    <h3 className="fw-bold text-dark">Civic Redressal Made Effortless</h3>
                    <p className="text-muted">A modern platform connecting active citizens directly with municipal engineers.</p>
                </div>

                <div className="row g-4">
                    <div className="col-md-4">
                        <RevealOnScroll className="h-100" delay={0}>
                        <div className="card h-100 shadow-sm feature-card">
                            <div className="card-body text-center p-4">
                                <div className="feature-icon-wrapper mb-3">
                                    <i className="bi bi-megaphone fs-2 text-success"></i>
                                </div>
                                <h4 className="fw-bold">
                                    1. Report
                                </h4>
                                <p className="text-muted">
                                    Report potholes, garbage, street lights,
                                    drainage and other civic problems with photo and GPS coordinates.
                                </p>
                                <Link to="/report" className="text-success fw-semibold text-decoration-none small">
                                    File a Complaint <i className="bi bi-arrow-right ms-1"></i>
                                </Link>
                            </div>
                        </div>
                        </RevealOnScroll>
                    </div>

                    <div className="col-md-4">
                        <RevealOnScroll className="h-100" delay={180}>
                        <div className="card h-100 shadow-sm feature-card">
                            <div className="card-body text-center p-4">
                                <div className="feature-icon-wrapper mb-3">
                                    <i className="bi bi-search fs-2 text-success"></i>
                                </div>
                                <h4 className="fw-bold">
                                    2. Track
                                </h4>
                                <p className="text-muted">
                                    Track live progress, SLA countdown, assigned officers,
                                    and scan instant QR tracking passes without login.
                                </p>
                                <Link to="/track" className="text-success fw-semibold text-decoration-none small">
                                    Check Status <i className="bi bi-arrow-right ms-1"></i>
                                </Link>
                            </div>
                        </div>
                        </RevealOnScroll>
                    </div>

                    <div className="col-md-4">
                        <RevealOnScroll className="h-100" delay={360}>
                        <div className="card h-100 shadow-sm feature-card">
                            <div className="card-body text-center p-4">
                                <div className="feature-icon-wrapper mb-3">
                                    <i className="bi bi-check-circle fs-2 text-success"></i>
                                </div>
                                <h4 className="fw-bold">
                                    3. Resolve
                                </h4>
                                <p className="text-muted">
                                    Authorities inspect, upload before/after photographic proof,
                                    and resolve complaints transparently with feedback.
                                </p>
                                <Link to="/dashboard" className="text-success fw-semibold text-decoration-none small">
                                    Explore Dashboard <i className="bi bi-arrow-right ms-1"></i>
                                </Link>
                            </div>
                        </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>

            {/* How Fixora Works Interactive Step Flow */}
            <section className="container py-5">
                <RevealOnScroll>
                <div className="card shadow-sm p-4 p-md-5 border-0 home-workflow-card">
                    <div className="text-center mb-5">
                        <span className="badge bg-success mb-2 px-3 py-2">Workflow</span>
                        <h3 className="fw-bold">How Your Issue Gets Fixed</h3>
                        <p className="text-muted">From citizen snapshot to on-site municipal verification</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-3">
                            <RevealOnScroll delay={0}>
                            <div className="flow-step-card h-100">
                                <div className="flow-step-circle">
                                    <i className="bi bi-camera-fill"></i>
                                </div>
                                <h5 className="fw-bold">1. Submit</h5>
                                <p className="small text-muted mb-0">Snap a photo with auto-detected GPS location.</p>
                            </div>
                            </RevealOnScroll>
                        </div>

                        <div className="col-md-3">
                            <RevealOnScroll delay={160}>
                            <div className="flow-step-card h-100">
                                <div className="flow-step-circle">
                                    <i className="bi bi-cpu-fill"></i>
                                </div>
                                <h5 className="fw-bold">2. AI Triaged</h5>
                                <p className="small text-muted mb-0">AI assigns category, priority & department SLA.</p>
                            </div>
                            </RevealOnScroll>
                        </div>

                        <div className="col-md-3">
                            <RevealOnScroll delay={320}>
                            <div className="flow-step-card h-100">
                                <div className="flow-step-circle">
                                    <i className="bi bi-tools"></i>
                                </div>
                                <h5 className="fw-bold">3. Dispatched</h5>
                                <p className="small text-muted mb-0">Ward officer initiates on-site repair work.</p>
                            </div>
                            </RevealOnScroll>
                        </div>

                        <div className="col-md-3">
                            <RevealOnScroll delay={480}>
                            <div className="flow-step-card h-100">
                                <div className="flow-step-circle">
                                    <i className="bi bi-patch-check-fill"></i>
                                </div>
                                <h5 className="fw-bold">4. Resolved</h5>
                                <p className="small text-muted mb-0">Before/After proof uploaded and verified.</p>
                            </div>
                            </RevealOnScroll>
                        </div>
                    </div>
                </div>
                </RevealOnScroll>
            </section>
        </div>
    );
}

export default Home;
