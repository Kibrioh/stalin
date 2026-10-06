import banner from "../src/assets/eco.png";

function Header() {
    return (
        <header className="loan-header">

            <img
                src={banner}
                alt="Bank With Us and Financing"
                className="loan-header-banner"
                style={{
                display: "block",
                width: "100%",
                height: "auto",
                margin: 0,
                padding: 0,
                objectFit: "contain",
                backgroundColor: "#ffffff",
                }}
            />

        </header>
    );
}
//how to use the header component in the loan calculator component

export default Header;