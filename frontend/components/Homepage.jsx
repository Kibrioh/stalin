
import React, { useState } from "react"

const packages = [
  {
    id: "lite",
    name: "Residential Lite",
    price: 5,
    description: "Unlimited standard data",
    features: [
      "Unlimited standard data",
      "Everyday browsing and streaming",
    ],
    trial: true,
    tag: "FIRST PACKAGE · FREE TRIAL",
  },
  {
    id: "residential",
    name: "Residential",
    price: 10,
    description: "For households and small teams",
    features: [
      "Unlimited standard data",
      "For households and small teams",
    ],
  },
  {
    id: "priority-1",
    name: "Priority 1 TB",
    price: 20,
    description: "Business-ready connectivity",
    features: [
      "1 TB priority data",
      "Business-ready connectivity",
    ],
  },
  {
    id: "priority-2",
    name: "Priority 2 TB",
    price: 30,
    description: "For high-demand business use",
    features: [
      "2 TB priority data",
      "For high-demand business use",
    ],
  },
];
function Homepage({ onApply, initialDetails }) {
  const [selectedPackage, setSelectedPackage] = useState(
    initialDetails?.id || "lite"
  );


  const selected = packages.find(
    (item) => item.id === selectedPackage
  );

  const hasTrial = selected.trial === true;

  const formatPrice = (price) =>
    `$${price.toFixed(2)}`;

  const handleContinue = () => {
    onApply(selected);
  };

  return (
    <div className="app-container">

      {/* NAVIGATION */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-logo">
            <span>◉</span>
            <i>✦</i>
          </div>

          <h2>OrbitLink</h2>

          <div className="brand-divider"></div>

          <span className="brand-subtitle">
            STARLINK INTERNET · ZIMBABWE
          </span>
        </div>

        <nav className="nav-links">
          <a href="#packages" className="active">Packages</a>
          <a href="#how-it-works">How it works</a>
          <a href="#support">Support</a>
        </nav>

        <div className="nav-actions">
          <button className="country-button">
            🇿🇼 <span>Zimbabwe · USD</span>
          </button>

          <button className="account-button">
            ♙ My account <span></span>
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Choose your Starlink
            <br />
            data package
          </h1>

          <p>
            Reliable satellite internet, with a simple plan
            for every need.
          </p>

          <div className="hero-benefits">
            <span>ϟ Fast activation</span>
            <span>◆ Secure payments</span>
            <span>♧ Local support</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="earth-glow"></div>
          <div className="satellite-dish">
            <div className="dish-head"></div>
            <div className="dish-neck"></div>
            <div className="dish-base"></div>
          </div>
        </div>
      </section>

      {/* FREE TRIAL BANNER */}
      <section className="trial-banner">
        <div className="gift-icon">🎁</div>

        <h2>3-DAY FREE TRIAL</h2>

        <div className="trial-divider"></div>

        <p>
          <strong>Your first package is free for 3 days.</strong>
          {" "}No charge during your trial. Choose a plan to get started.
        </p>
      </section>

      {/* PACKAGE CARDS */}
      <section className="packages-section" id="packages">
        <div className="packages-grid">

          {packages.map((plan) => {
            const isSelected = selectedPackage === plan.id;

            return (
              <div
                key={plan.id}
                className={`package-card ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => setSelectedPackage(plan.id)}
              >
                {plan.tag && (
                  <div className="package-tag">
                    {plan.tag}
                  </div>
                )}

                <div className="package-content">
                  <h2>{plan.name}</h2>

                  <div className="package-price">
                    <span>{formatPrice(plan.price)}</span>
                    <small>/ month</small>
                  </div>

                  <div className="package-divider"></div>

                  <div className="package-features">
                    {plan.features.map((feature, index) => (
                      <div className="feature" key={index}>
                        <span className="check-icon">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className={`package-button ${
                    isSelected ? "primary-button" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedPackage(plan.id);
                    onApply(plan);
                  }}
                >
                  {isSelected && plan.trial
                    ? "Start free trial"
                    : isSelected
                    ? "Selected plan"
                    : "Choose plan"}
                </button>
              </div>
            );
          })}

        </div>
      </section>

      {/* CHECKOUT SUMMARY */}
      <section className="checkout-summary">

        <div className="summary-title">
          <h2>Your selection</h2>
        </div>

        <div className="summary-item">
          <span>{hasTrial ? "First 3 days" : "Due today"}</span>
          <strong>
            {hasTrial ? "$0.00" : formatPrice(selected.price)}
          </strong>
        </div>

        <div className="summary-item">
          <span>{hasTrial ? "After trial" : "Monthly renewal"}</span>
          <strong>{formatPrice(selected.price)}<small>/month</small></strong>
        </div>

        <div className="summary-item currency-item">
          <span>Billing currency</span>
          <strong>USD</strong>
        </div>

        <button
          className="continue-button"
          onClick={() => onApply(selected)}
        >
          Continue <span>→</span>
        </button>

      </section>

      {/* PRICING DISCLAIMER */}
      <p className="pricing-disclaimer">
        Illustrative Zimbabwe market pricing. Confirm plan availability
        and final reseller charges before payment. Three-day trial is
        an OrbitLink promotion, not an official Starlink offer.
      </p>

      {/* FOOTER */}
      <footer className="footer" id="support">
        <div>
          <span>♙</span> Secure payments
        </div>

        <div>
          <span>ϟ</span> Quick activation
        </div>

        <div>
          <span>♧</span> Local customer support
        </div>
      </footer>

    </div>
  );
}

export default Homepage;
