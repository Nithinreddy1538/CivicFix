import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

function ComplaintMap({ complaints = [] }) {

    const validComplaints = complaints.filter(
        complaint =>
            complaint.latitude !== null &&
            complaint.longitude !== null &&
            complaint.latitude !== "" &&
            complaint.longitude !== ""
    );

    const defaultPosition = [20.5937, 78.9629];

    const center =
        validComplaints.length > 0
            ? [
                Number(validComplaints[0].latitude),
                Number(validComplaints[0].longitude)
            ]
            : defaultPosition;

    return (
        <MapContainer
            center={center}
            zoom={validComplaints.length > 0 ? 14 : 5}
            style={{
                height: "500px",
                width: "100%"
            }}
        >

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validComplaints.map(complaint => (

                <Marker
                    key={complaint.id}
                    position={[
                        Number(complaint.latitude),
                        Number(complaint.longitude)
                    ]}
                >

                    <Popup>

                        <div>

                            <h6 className="text-success">
                                {complaint.complaint_id}
                            </h6>

                            <h6>
                                {complaint.title}
                            </h6>

                            <p className="mb-1 mt-2">
                                {complaint.location}
                            </p>

                            <span className="badge bg-success">
                                {complaint.status.replace(
                                    "_",
                                    " "
                                )}
                            </span>

                            <span className="badge bg-danger ms-2">
                                {complaint.priority}
                            </span>

                        </div>

                    </Popup>

                </Marker>

            ))}

        </MapContainer>
    );
}

export default ComplaintMap;

