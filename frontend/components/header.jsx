import banner from "../src/assets/cabs.png";

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
//how to use the header component in the loan calculator component

export default Header;