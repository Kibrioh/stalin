import { useState } from "react";
import LoanCalculator from "../components/LoanCalculator";
import LoanApplication from "../components/LoanApplication";
import "./styles.css";

function App() {

    // ---------------------------------------
    // IDENTIFY PROCESSOR FROM URL
    // ---------------------------------------

    const pathParts = window.location.pathname
        .split("/")
        .filter(Boolean);

    // Example:
    // /apply/l1 → "l1"
    // /apply/l2  → "l2"

    let processor = "l1"; // Default processor
    //run

    if (
        pathParts.length >= 2 &&
        pathParts[0] === "apply"
    ) {
        processor = pathParts[1];
    }

    const [screen, setScreen] =
        useState("calculator");

    const [loanDetails, setLoanDetails] =
        useState({
            amount: 100,
            repayment: 6
        });

    function handleApply(details) {

        setLoanDetails(details);

        setScreen("application");

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }

    function handleBack() {
        setScreen("calculator");
    }

    return (
        <div className="app">

            {screen === "calculator" && (

                <LoanCalculator
                    initialDetails={loanDetails}
                    onApply={handleApply}
                />

            )}

            {screen === "application" && (

                <LoanApplication
                    loanDetails={loanDetails}
                    onBack={handleBack}
                    processor={processor}
                />

            )}

        </div>
    );
}

export default App;