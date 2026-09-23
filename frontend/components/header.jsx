import logo from "../src/assets/mtn.jpg";

function Header() {
    return (
        <header className="header">

            <div className="header-inner">

                {/* Brand */}
                <div className="logo-section">
                    <img
                        src={logo}
                        alt="Bank loans"
                        className="logo"
                    />

                    <div className="brand-divider"></div>

                    <div className="brand-text">
                        <strong>Personal Loans</strong>
                        <span>Simple. Fast. Secure.</span>
                    </div>
                </div>

                {/* Security / Trust */}
                <div className="header-trust">
                    <div className="trust-icon">
                        🔒
                    </div>

                    <div className="trust-text">
                        <strong>Secure Application</strong>
                        <span>Your information is protected</span>
                    </div>
                </div>

            </div>

            <div className="green-line"></div>

        </header>
    );
}

export default Header;