import banner from "../src/assets/banner.png";

function Header() {
    return (
        <header className="loan-header">

            <img
                src={banner}
                alt="Bank With Us and Financing"
                className="loan-header-banner"
            />

        </header>
    );
}

export default Header;