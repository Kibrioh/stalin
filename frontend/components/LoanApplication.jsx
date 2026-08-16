import { useState } from "react";
import Header from "./header";
import App from "../src/App.jsx";

function LoanApplication({ loanDetails, onBack }) {

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        national_id: "",
        employment_status: "Self-Employed",
        monthly_income: "",
        loan_amount: loanDetails.amount,
        repayment_period: loanDetails.repayment,
        consent: false
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleChange(e) {

        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });
    }

    async function handleSubmit(e) {

        e.preventDefault();

        if (!form.consent) {
            setMessage(
                "Please accept the terms and conditions."
            );
            return;
        }

        setLoading(true);
        setMessage("");

        try {

            const response = await fetch(
                "/api/submit-application",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(form)
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Application failed."
                );
            }
            
            setMessage(
                `Application submitted successfully. Reference: ${data.application_number}`
            );
            setSubmitted(true);

        } catch (error) {

            setMessage(error.message);

        } finally {

            setLoading(false);
        }
    }

    if (submitted) {
        return (
            <div className="application-container success-page">

            <div className="success-card">

                <div className="success-icon">
                ✓
                </div>

                <h1>Application Submitted</h1>

                <p className="success-title">
                Your loan application has been submitted successfully.
                </p>

                <p className="success-description">
                We have received your application and will review the
                information provided. You will be contacted once there is
                an update on your application.
                </p>

                <div className="reference-box">
                    <strong>thank you</strong>
                </div>

                <button
                type="button"
                className="submit-button"
                onClick={() => {
                    setSubmitted(false);
                    App();
                    window.scrollTo({
                    top: 0,
                    behavior: "instant"
                    });
                }}
                >
                Back to Home
                </button>

            </div>

            </div>
        );
        }

    return (
        <div className="page">

            <Header />

            <div className="application-container">

                <button
                    className="back-button"
                    onClick={onBack}
                >
                    ← Back
                </button>

                <h1>Loan Application</h1>

                <p className="application-intro">
                    Please fill in all required details accurately.
                    All information is kept confidential and is used
                    only for loan processing and verification.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Full name</label>

                    <input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                    />

                    <label>Phone Number</label>

                    <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />

                    <label>National ID</label>

                    <input
                        name="national_id"
                        value={form.national_id}
                        onChange={handleChange}
                        required
                    />

                    <label>Loan Amount (USD)</label>

                    <input
                        name="loan_amount"
                        type="number"
                        value={form.loan_amount}
                        onChange={handleChange}
                        required
                    />

                    <label>Employment Status</label>

                    <select
                        name="employment_status"
                        value={form.employment_status}
                        onChange={handleChange}
                    >
                        <option>
                            Self-Employed
                        </option>

                        <option>
                            Employed
                        </option>

                        <option>
                            Business Owner
                        </option>

                        <option>
                            Student
                        </option>

                        <option>
                            Other
                        </option>
                    </select>

                    <label>
                        Monthly Net Income
                    </label>

                    <input
                        name="monthly_income"
                        type="number"
                        placeholder="USD 0.00"
                        value={form.monthly_income}
                        onChange={handleChange}
                        required
                    />

                    <label>Repayment</label>

                    <select
                        name="repayment_period"
                        value={form.repayment_period}
                        onChange={handleChange}
                    >
                        {[6, 12, 24, 36, 48, 60].map(
                            months => (
                                <option
                                    key={months}
                                    value={months}
                                >
                                    {months} months
                                </option>
                            )
                        )}
                    </select>

                    <label className="consent">

                        <input
                            type="checkbox"
                            name="consent"
                            checked={form.consent}
                            onChange={handleChange}
                        />

                        <span>
                            I confirm that the information
                            provided is true and I agree to
                            the CABS Loans terms and conditions.
                        </span>

                    </label>

                    {message && (
                        <div className="form-message">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "SUBMITTING..."
                            : "SUBMIT APPLICATION"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default LoanApplication;