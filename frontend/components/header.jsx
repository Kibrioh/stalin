import logo from "../src/assets/boa.jpg";
function Header() {
    return (
        <header className="header">

            <div className="logo-section">
                <img
                    src={logo}
                    alt="Bank loans"
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