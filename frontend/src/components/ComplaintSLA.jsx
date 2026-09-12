import { useEffect, useState } from "react";

function ComplaintSLA({ complaint }) {

    const [remaining, setRemaining] =
        useState("");

    const calculateRemaining = () => {

        const deadline =
            new Date(complaint.created_at).getTime() +
            (complaint.sla_hours || 48) *
            60 *
            60 *
            1000;

        const difference =
            deadline - Date.now();

        if (difference <= 0) {
            setRemaining("SLA expired");
            return;
        }

        const hours =
            Math.floor(
                difference / (1000 * 60 * 60)
            );

        const minutes =
            Math.floor(
                (difference %
                    (1000 * 60 * 60)) /
                    (1000 * 60)
            );

        setRemaining(
            `${hours}h ${minutes}m remaining`
        );
    };

    useEffect(() => {

        calculateRemaining();

        const interval =
            setInterval(
                calculateRemaining,
                60000
            );

        return () =>
            clearInterval(interval);

    }, [complaint]);

    const expired =
        remaining === "SLA expired";

    return (
        <div
            className={`alert ${
                expired
                    ? "alert-danger"
                    : "alert-info"
            } mt-4`}
        >

            <i
                className={`bi ${
                    expired
                        ? "bi-exclamation-triangle"
                        : "bi-clock"
                } me-2`}
            ></i>

            <strong>
                Resolution Target:
            </strong>{" "}

            {expired
                ? "The expected resolution time has passed."
                : remaining}

        </div>
    );
}

export default ComplaintSLA;

