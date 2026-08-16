function Header() {
    return (
        <header className="header">

            <div className="logo-section">
                <img
                    src="../src/assets/logo.png"
                    alt="CABS"
                    className="logo"
                />

                <div className="welcome">
                    <span className="user-icon">♙</span>
                    <span>Welcome</span>
                </div>
            </div>

            <div className="green-line"></div>

        </header>
    );
}

export default Header;