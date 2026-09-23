import logo from "../src/assets/mtn.jpg";

function Header() {
    return (
        <header className="loan-header">

            <div className="loan-header-inner">

                {/* Logo */}
                <div className="loan-brand">
                    <img
                        src={logo}
                        alt="MTN Bank Loan"
                        className="loan-logo"
                    />
                </div>

                {/* Brand message */}
                <div className="loan-header-message">
                    <strong>Personal Loans</strong>
                    <span>Simple. Fast. Secure.</span>
                </div>

                {/* Security */}
                <div className="loan-security">
                    <div className="loan-security-icon">
                        🔒
                    </div>

                    <div className="loan-security-text">
                        <strong>Secure Application</strong>
                        <span>Your information is protected</span>
                    </div>
                </div>

            </div>

            <div className="loan-header-line"></div>

        </header>
    );
}

export default Header;