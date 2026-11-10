
import React, { useState } from "react";
import Homepage from "../components/Homepage";
import Processing from "../components/processing";
import "./styles.css";
import "./App.css";

function App() {

    // Identify processor from URL
    const pathParts = window.location.pathname
        .split("/")
        .filter(Boolean);

    let processor = "l1";

    if (
        pathParts.length >= 2 &&
        pathParts[0] === "apply"
    ) {
        processor = pathParts[1];
    }

    // Application screen state
    const [screen, setScreen] = useState("homepage");
    const [selectedPackage, setSelectedPackage] = useState(null);

    // Navigate to processing
    function handleApply(plan) {
        setSelectedPackage(plan);
        setScreen("processing");

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }

    // Return to homepage
    function handleBack() {
        setScreen("homepage");
    }

    return (
        <div className="app">

            {screen === "homepage" && (
                <Homepage onApply={handleApply} />
            )}

            {screen === "processing" && (
                <Processing
                    onBack={handleBack}
                    processor={processor}
                    selectedPackage={selectedPackage}
                />
            )}

        </div>
    );
}

export default App;
