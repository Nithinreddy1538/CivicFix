CATEGORIES = {
    "pothole": [
        "pothole", "potholes", "road damage", "road broken", "road hole", "damaged road",
        "road", "roads", "crater", "tarmac", "asphalt", "bump", "speed breaker",
        "highway", "street broken", "pit", "crack", "footpath", "sidewalk", "divider"
    ],
    "street_light": [
        "street light", "lamp", "light not working", "dark road", "street lamp",
        "light", "lights", "dark", "darkness", "streetlight", "bulb", "pole", "wire",
        "electric pole", "illumination", "night", "no light", "broken light", "tube light"
    ],
    "garbage": [
        "garbage", "waste", "trash", "dustbin", "dump",
        "litter", "debris", "smell", "stink", "rotting", "filth", "cleanliness",
        "plastics", "rubbish", "refuse", "bin", "waste dump", "overflowing garbage"
    ],
    "water_leakage": [
        "water leakage", "water pipe", "pipe broken", "water leaking",
        "water", "leak", "leaking", "leakage", "pipeline", "pipe", "tap",
        "drinking water", "burst", "water supply", "tanker", "overflow", "pipeline burst"
    ],
    "drainage": [
        "drain", "drainage", "sewage", "blocked drain",
        "gutter", "manhole", "clogged", "overflowing drain", "stagnant water",
        "mosquito", "sewer", "sewerage", "foul smell", "gutters", "open drain"
    ],
    "traffic_signal": [
        "traffic signal", "traffic light", "signal not working",
        "traffic", "signal", "signals", "red light", "zebra crossing", "junction",
        "congestion", "signboard", "blinker", "traffic jam", "traffic light broken"
    ],
    "public_property": [
        "bench", "park", "public property", "government building",
        "garden", "playground", "fence", "bus stop", "shelter", "wall",
        "public toilet", "monument", "statue", "railing", "boundary", "community hall"
    ]
}

DEPARTMENTS = {
    "pothole": "Roads",
    "street_light": "Electricity",
    "garbage": "Sanitation",
    "water_leakage": "Water Supply",
    "drainage": "Sanitation",
    "traffic_signal": "Traffic",
    "public_property": "Public Works",
    "other": "General"
}

CRITICAL_KEYWORDS = [
    "urgent", "emergency", "danger", "dangerous", "hazard", "hazardous",
    "life threatening", "accident", "fatal", "severe", "risk", "fire",
    "sparking", "exposed wire", "electrocution", "collapsed", "sinkhole"
]

HIGH_KEYWORDS = [
    "huge", "big", "broken", "overflowing", "heavy", "burst",
    "blocked", "deep", "damage", "foul", "major", "serious"
]

LOW_KEYWORDS = [
    "minor", "small", "routine", "paint", "cleaning", "slight"
]


def classify_complaint(text):
    if not text:
        return {
            "category": "other",
            "priority": "medium",
            "department": "General"
        }

    text_lower = str(text).lower()

    scores = {}

    for category, keywords in CATEGORIES.items():
        score = 0
        for keyword in keywords:
            if keyword in text_lower:
                # Give higher weight to multi-word specific phrases
                weight = 2 if " " in keyword else 1
                score += weight

        scores[category] = score

    best_category = max(scores, key=scores.get)
    if scores[best_category] == 0:
        best_category = "other"

    # Determine Priority dynamically based on urgency indicators
    if any(k in text_lower for k in CRITICAL_KEYWORDS):
        priority = "critical"
    elif any(k in text_lower for k in HIGH_KEYWORDS) or best_category in ["pothole", "traffic_signal", "water_leakage"]:
        priority = "high"
    elif any(k in text_lower for k in LOW_KEYWORDS):
        priority = "low"
    else:
        priority = "medium"

    return {
        "category": best_category,
        "priority": priority,
        "department": DEPARTMENTS.get(best_category, "General")
    }
