import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function HeatLayer({ complaints }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const points = complaints
            .filter((c) => c.latitude && c.longitude)
            .map((c) => [
                parseFloat(c.latitude),
                parseFloat(c.longitude),
                c.priority === "critical" ? 1.0 : c.priority === "high" ? 0.7 : 0.4
            ]);

        if (points.length === 0) return;

        const heat = L.heatLayer(points, {
            radius: 35,
            blur: 25,
            maxZoom: 17,
            gradient: {
                0.2: "#0dcaf0",
                0.4: "#198754",
                0.6: "#ffc107",
                0.8: "#fd7e14",
                1.0: "#dc3545"
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [complaints, map]);

    return null;
}

function ComplaintHeatmap({ complaints = [] }) {
    const valid = complaints.filter((c) => c.latitude && c.longitude);
    const defaultPosition = valid.length > 0
        ? [parseFloat(valid[0].latitude), parseFloat(valid[0].longitude)]
        : [13.6288, 79.4192];

    return (
        <div className="card shadow-sm mt-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="fw-bold mb-0">
                            <i className="bi bi-fire text-danger me-2"></i>
                            Civic Issue Hotspot Heatmap
                        </h5>
                        <small className="text-muted">
                            Geographic density & high-frequency grievance areas
                        </small>
                    </div>

                    <div className="d-flex align-items-center gap-2 small">
                        <span className="badge bg-danger">Critical Hotspot</span>
                        <span className="badge bg-warning text-dark">High Density</span>
                        <span className="badge bg-success">Moderate / Low</span>
                    </div>
                </div>

                <div style={{ height: "420px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
                    <MapContainer
                        center={defaultPosition}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <HeatLayer complaints={complaints} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default ComplaintHeatmap;

