import { useState } from "react";

function LoanForm() {

    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        email: "",
        id_number: "",
        date_of_birth: "",
        employment_status: "",
        employer_name: "",
        monthly_income: "",
        other_income: "",
        existing_loan_obligations: "",
        loan_amount: "",
        loan_purpose: "",
        repayment_period: ""
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    function handleChange(event) {

        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        });
    }

    async function handleSubmit(event) {

        event.preventDefault();

        setLoading(true);
        setError("");

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Application failed"
                );
            }

            setResult(data);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    }

    if (result) {

        return (
            <div>
                <h2>
                    Application Submitted
                </h2>

                <p>
                    Your application number is:
                </p>

                <strong>
                    {result.application_number}
                </strong>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>

            <h2>Loan Application</h2>

            <input
                name="full_name"
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                required
            />

            <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
            />

            <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
            />

            <input
                name="id_number"
                placeholder="ID Number"
                value={form.id_number}
                onChange={handleChange}
            />

            <input
                name="monthly_income"
                type="number"
                placeholder="Monthly Income"
                value={form.monthly_income}
                onChange={handleChange}
            />

            <input
                name="loan_amount"
                type="number"
                placeholder="Loan Amount"
                value={form.loan_amount}
                onChange={handleChange}
                required
            />

            <textarea
                name="loan_purpose"
                placeholder="Purpose of Loan"
                value={form.loan_purpose}
                onChange={handleChange}
                required
            />

            <input
                name="repayment_period"
                type="number"
                placeholder="Repayment Period (months)"
                value={form.repayment_period}
                onChange={handleChange}
                required
            />

            {error && (
                <p>{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
            >
                {loading
                    ? "Submitting..."
                    : "Submit Application"}
            </button>

        </form>
    );
}

export default LoanForm;