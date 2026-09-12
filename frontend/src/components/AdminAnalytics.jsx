import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

function AdminAnalytics({ complaints = [] }) {

    const statusData = [
        {
            name: "Pending",
            value: complaints.filter(
                c => c.status === "pending"
            ).length
        },
        {
            name: "Assigned",
            value: complaints.filter(
                c => c.status === "assigned"
            ).length
        },
        {
            name: "In Progress",
            value: complaints.filter(
                c => c.status === "in_progress"
            ).length
        },
        {
            name: "Resolved",
            value: complaints.filter(
                c => c.status === "resolved"
            ).length
        },
        {
            name: "Rejected",
            value: complaints.filter(
                c => c.status === "rejected"
            ).length
        }
    ];

    const priorityData = [
        {
            name: "Low",
            value: complaints.filter(
                c => c.priority === "low"
            ).length
        },
        {
            name: "Medium",
            value: complaints.filter(
                c => c.priority === "medium"
            ).length
        },
        {
            name: "High",
            value: complaints.filter(
                c => c.priority === "high"
            ).length
        },
        {
            name: "Critical",
            value: complaints.filter(
                c => c.priority === "critical"
            ).length
        }
    ];

    const categoryNames = {
        pothole: "Road Pothole",
        street_light: "Street Light",
        garbage: "Garbage",
        water_leakage: "Water Leakage",
        drainage: "Drainage",
        traffic_signal: "Traffic Signal",
        public_property: "Public Property",
        other: "Other"
    };

    const categoryData = Object.keys(categoryNames).map(
        category => ({
            name: categoryNames[category],
            complaints: complaints.filter(
                c => c.category === category
            ).length
        })
    );

    const total = complaints.length;

    const resolved = complaints.filter(
        c => c.status === "resolved"
    ).length;

    const resolutionRate =
        total > 0
            ? Math.round((resolved / total) * 100)
            : 0;

    const monthlyData = {};

    complaints.forEach(complaint => {

        const date = new Date(complaint.created_at);

        const month = date.toLocaleString(
            "default",
            {
                month: "short",
                year: "numeric"
            }
        );

        if (!monthlyData[month]) {
            monthlyData[month] = 0;
        }

        monthlyData[month]++;
    });

    const monthlyChartData = Object.keys(monthlyData)
        .map(month => ({
            month,
            complaints: monthlyData[month]
        }))
        .reverse();

    return (
        <div>

            <div className="row g-4 mb-4">

                <div className="col-md-4">

                    <div className="card shadow-sm h-100">

                        <div className="card-body text-center">

                            <h6 className="text-muted">
                                Total Complaints
                            </h6>

                            <h1 className="fw-bold">
                                {total}
                            </h1>

                            <small className="text-muted">
                                All reported civic issues
                            </small>

                        </div>

                    </div>

                </div>

                <div className="col-md-4">

                    <div className="card shadow-sm h-100">

                        <div className="card-body text-center">

                            <h6 className="text-muted">
                                Resolved Complaints
                            </h6>

                            <h1 className="fw-bold text-success">
                                {resolved}
                            </h1>

                            <small className="text-muted">
                                Successfully resolved
                            </small>

                        </div>

                    </div>

                </div>

                <div className="col-md-4">

                    <div className="card shadow-sm h-100">

                        <div className="card-body text-center">

                            <h6 className="text-muted">
                                Resolution Rate
                            </h6>

                            <h1 className="fw-bold text-primary">
                                {resolutionRate}%
                            </h1>

                            <div className="progress mt-3">

                                <div
                                    className="progress-bar bg-success"
                                    style={{
                                        width: `${resolutionRate}%`
                                    }}
                                >
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <div className="row g-4 mb-4">

                <div className="col-lg-6">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Complaints by Status
                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <BarChart
                                    data={statusData}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="name"
                                    />

                                    <YAxis />

                                    <Tooltip />

                                    <Legend />

                                    <Bar
                                        dataKey="value"
                                        name="Complaints"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

                <div className="col-lg-6">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Complaints by Priority
                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <PieChart>

                                    <Pie
                                        data={priorityData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >

                                        {priorityData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={index}
                                                />
                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

            </div>

            <div className="row g-4 mb-4">

                <div className="col-lg-7">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Complaints by Category
                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={400}
                            >

                                <BarChart
                                    data={categoryData}
                                    layout="vertical"
                                    margin={{
                                        left: 30
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        type="number"
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="complaints"
                                        name="Complaints"
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

                <div className="col-lg-5">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Complaint Priority
                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={400}
                            >

                                <PieChart>

                                    <Pie
                                        data={priorityData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        label
                                    >

                                        {priorityData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={index}
                                                />
                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

            </div>

            <div className="card shadow-sm">

                <div className="card-body">

                    <h5 className="fw-bold mb-4">
                        Monthly Complaint Trend
                    </h5>

                    <ResponsiveContainer
                        width="100%"
                        height={350}
                    >

                        <LineChart
                            data={monthlyChartData}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="month"
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="complaints"
                                name="Complaints"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>
    );
}

export default AdminAnalytics;

