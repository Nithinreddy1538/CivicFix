import ComplaintMap from "./ComplaintMap";

function ComplaintLocation({ complaint }) {
    const latitude = Number(complaint?.latitude);
    const longitude = Number(complaint?.longitude);
    const hasCoordinates = Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        complaint?.latitude !== "" &&
        complaint?.longitude !== "" &&
        complaint?.latitude !== null &&
        complaint?.longitude !== null;
    const address = complaint?.location?.trim() || "";
    const mapSearch = hasCoordinates ? `${latitude},${longitude}` : address;
    const mapUrl = mapSearch
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearch)}`
        : null;

    return (
        <section className="card shadow-sm mt-4" aria-labelledby="complaint-location-title">
            <div className="card-body">
                <h5 id="complaint-location-title" className="fw-bold mb-3">
                    Complaint Location
                </h5>

                {mapUrl ? (
                    <a
                        className="d-inline-flex align-items-start gap-2 mb-3 text-decoration-none"
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open complaint location in Google Maps: ${address || `${latitude}, ${longitude}`}`}
                    >
                        <i className="bi bi-geo-alt-fill mt-1" aria-hidden="true" />
                        <span>
                            <span className="d-block fw-semibold">{address || "Reported coordinates"}</span>
                            {hasCoordinates && (
                                <small className="text-muted">{latitude.toFixed(6)}, {longitude.toFixed(6)}</small>
                            )}
                            <small className="d-block">Open this complaint location in Maps ↗</small>
                        </span>
                    </a>
                ) : (
                    <div className="alert alert-warning mb-0">
                        The citizen did not provide a location or map coordinates for this complaint.
                    </div>
                )}

                {hasCoordinates ? (
                    <ComplaintMap complaints={[complaint]} />
                ) : address ? (
                    <p className="text-muted small mb-0">
                        This complaint has an address but no GPS pin. Open it in Maps above to view the reported address.
                    </p>
                ) : null}
            </div>
        </section>
    );
}

export default ComplaintLocation;
