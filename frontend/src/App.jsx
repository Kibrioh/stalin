import { useState } from "react";
import LoanCalculator from "../components/LoanCalculator";
import LoanApplication from "../components/LoanApplication";
import "./styles.css";

function App() {
    const [screen, setScreen] = useState("calculator");

    const [loanDetails, setLoanDetails] = useState({
        amount: 500,
        repayment: 12
    });

    function handleApply(details) {
        setLoanDetails(details);
        setScreen("application");
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
                />
            )}

        </div>
    );
}

export default App;