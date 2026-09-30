import { useState } from "react";
import Header from "./header";

function LoanCalculator({ initialDetails, onApply }) {

    const [amount, setAmount] =
        useState(initialDetails.amount);

    const [repayment, setRepayment] =
        useState(initialDetails.repayment);

    const interestRate = 0.12;

    const totalAmount =
        amount + (amount * interestRate);

    const monthlyPayment =
        totalAmount / repayment;

    function handleApply() {
        onApply({
            amount,
            repayment
        });
    }

    return (
        <div className="page">

            <Header />

            <section className="hero">

                <h1>
                    Get Your Loan
                    <span> within 24 hours</span>
                </h1>

                <p>
                    Fast approval • Affordable rates • Flexible terms
                </p>

            </section>

            <section className="calculator-card">

                <div className="calculator">

                    <h3>Bank Loan Application</h3>

                    <div className="divider"></div>

                    <label>LOAN AMOUNT</label>

                    <h2>
                         $ {amount.toLocaleString()}
                    </h2>

                    <input
                        type="range"
                        min="50"
                        max="5000"
                        step="100"
                        value={amount}
                        onChange={(e) =>
                            setAmount(Number(e.target.value))
                        }
                    />

                    <div className="range-labels">
                        <span>$ 50</span>
                        <span>$ 5000</span>
                    </div>

                    <label>LOAN TERM</label>

                    <h2>
                        {repayment} months
                    </h2>

                    <div className="term-buttons">

                        {[1, 2, 3, 4, 5, 6].map(
                            (months) => (

                                <button
                                    key={months}
                                    className={
                                        repayment === months
                                            ? "active-term"
                                            : ""
                                    }
                                    onClick={() =>
                                        setRepayment(months)
                                    }
                                >
                                    {months}
                                    <span>months</span>
                                </button>

                            )
                        )}

                    </div>

                    <div className="monthly-payment">

                        <span>
                            MONTHLY PAYMENT
                        </span>

                        <strong>
                            $
                            {monthlyPayment.toFixed(2)}
                        </strong>

                        <small>
                            Interest rate: 12% APR
                        </small>

                    </div>

                    <button
                        className="apply-button"
                        onClick={handleApply}
                    >
                        APPLY NOW
                    </button>

                </div>

                <div className="features">

                    <Feature
                        icon="⚡"
                        title="Fast Approval"
                        text="Within 24 hours"
                    />

                    <Feature
                        icon="💰"
                        title="Low Rates"
                        text="From 8%"
                    />

                    <Feature
                        icon="🔒"
                        title="Secure"
                        text="Bank-level security"
                    />

                </div>

            </section>

        </div>
    );
}

function Feature({ icon, title, text }) {

    return (
        <div className="feature">

            <div className="feature-icon">
                {icon}
            </div>

            <div>
                <strong>{title}</strong>
                <small>{text}</small>
            </div>

        </div>
    );
}

export default LoanCalculator;