import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api";

function App() {
  const [jobText, setJobText] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [detectedInfo, setDetectedInfo] = useState({
    company: "",
    website: "",
    email: "",
    phone: "",
    location: "",
    salary: "",
    jobTitle: "",
  });

  // =====================================================
  // AUTO DETECT INFORMATION
  // =====================================================

  const detectInformation = () => {
    if (!jobText.trim()) {
      alert("Please paste a job advertisement first.");
      return;
    }

    const text = jobText;

    let detected = {
      company: "",
      website: "",
      email: "",
      phone: "",
      location: "",
      salary: "",
      jobTitle: "",
    };

    // EMAIL
    const emailMatch = text.match(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
    );

    if (emailMatch) {
      detected.email = emailMatch[0];
      setContactEmail(emailMatch[0]);
    }

    // WEBSITE
    const websiteMatch = text.match(
      /https?:\/\/[^\s<>"']+/gi
    );

    if (websiteMatch) {
      detected.website = websiteMatch[0].replace(
        /[.,!?;:)\]]+$/,
        ""
      );

      setWebsite(detected.website);
    }

    // COMPANY
    const companyPatterns = [
      /company\s*(?:name)?\s*[:\-]\s*([^\n]+)/i,
      /organization\s*(?:name)?\s*[:\-]\s*([^\n]+)/i,
      /organisation\s*(?:name)?\s*[:\-]\s*([^\n]+)/i,
      /([A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*){0,5})\s+is hiring/i,
      /join\s+([A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*){0,5})/i,
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);

      if (match && match[1]) {
        detected.company = match[1]
          .trim()
          .replace(/[.,!?;:]+$/, "");

        setCompanyName(detected.company);
        break;
      }
    }

    // PHONE
    const phoneMatch = text.match(
      /(?:\+91[\s-]?)?[6-9]\d{9}/g
    );

    if (phoneMatch) {
      detected.phone = phoneMatch[0];
    }

    // LOCATION
    const locationMatch = text.match(
      /(?:location|work location|job location|based in)\s*[:\-]\s*([^\n]+)/i
    );

    if (locationMatch) {
      detected.location = locationMatch[1].trim();
    }

    // SALARY
    const salaryPatterns = [
      /₹\s?[\d,]+(?:\s?(?:per month|\/month|monthly|per year|LPA|lakhs?))?/gi,
      /(?:rs\.?|inr)\s?[\d,]+(?:\s?(?:per month|\/month|monthly|per year|LPA|lakhs?))?/gi,
      /[\d,]+\s?(?:LPA|lakhs?)\b/gi,
    ];

    for (const pattern of salaryPatterns) {
      const salaryMatch = text.match(pattern);

      if (salaryMatch) {
        detected.salary = salaryMatch[0];
        break;
      }
    }

    // JOB TITLE
    const jobTitlePatterns = [
      /job\s*title\s*[:\-]\s*([^\n]+)/i,
      /position\s*[:\-]\s*([^\n]+)/i,
      /role\s*[:\-]\s*([^\n]+)/i,
    ];

    for (const pattern of jobTitlePatterns) {
      const match = text.match(pattern);

      if (match && match[1]) {
        detected.jobTitle = match[1].trim();
        break;
      }
    }

    setDetectedInfo(detected);

    alert("✅ Information detected successfully!");
  };

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`);

      if (!response.ok) {
        throw new Error("Could not load history");
      }

      const data = await response.json();

      setHistory(data);
    } catch (err) {
      console.error("History error:", err);
      setError("Could not connect to backend history.");
    }
  };

  // =====================================================
  // LOAD HISTORY ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    loadHistory();
  }, []);

  // =====================================================
  // ANALYZE JOB
  // =====================================================

  const analyzeJob = async () => {
    if (!jobText.trim()) {
      alert("Please enter a job advertisement.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          jobText: jobText,
          companyName: companyName,
          website: website,
          contactEmail: contactEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();

      setResult(data);

      await loadHistory();
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        "Could not connect to TrustLens backend. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
// VERIFY COMPANY & WEBSITE
// =====================================================

const verifyCompany = async () => {
  if (
    !companyName.trim() &&
    !website.trim() &&
    !contactEmail.trim()
  ) {
    alert(
      "Please provide a company name, website, or recruiter email first."
    );
    return;
  }

  setVerifying(true);
  setError("");

  try {
    const response = await fetch(`${API_URL}/verify`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        companyName: companyName,
        website: website,
        email: contactEmail,
      }),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    const data = await response.json();

    setVerification(data);

  } catch (err) {
    console.error("Verification error:", err);

    setError(
      "Could not connect to the company verification service."
    );
  } finally {
    setVerifying(false);
  }
};

  // =====================================================
  // DELETE ANALYSIS
  // =====================================================

  const deleteAnalysis = async (id) => {
    try {
      const response = await fetch(
        `${API_URL}/history/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      await loadHistory();
    } catch (err) {
      console.error("Delete error:", err);

      alert("Could not delete analysis.");
    }
  };

  // =====================================================
  // CLEAR FORM
  // =====================================================

  const clearForm = () => {
    setJobText("");
    setCompanyName("");
    setWebsite("");
    setContactEmail("");
    setResult(null);
    setError("");
    setVerification(null);

    setDetectedInfo({
      company: "",
      website: "",
      email: "",
      phone: "",
      location: "",
      salary: "",
      jobTitle: "",
    });
  };

  // =====================================================
// DASHBOARD STATISTICS
// =====================================================

const totalAnalyses = history.length;

const lowRisk = history.filter(
  (item) =>
    item.riskLevel &&
    item.riskLevel.toUpperCase() === "LOW RISK"
).length;

const mediumRisk = history.filter(
  (item) =>
    item.riskLevel &&
    item.riskLevel.toUpperCase() === "MEDIUM RISK"
).length;

const highRisk = history.filter(
  (item) =>
    item.riskLevel &&
    item.riskLevel.toUpperCase() === "HIGH RISK"
).length;

const averageScore =
  totalAnalyses > 0
    ? Math.round(
        history.reduce(
          (total, item) =>
            total + Number(item.trustScore || 0),
          0
        ) / totalAnalyses
      )
    : 0;
  // =====================================================
  // SCORE HELPERS
  // =====================================================

  const getScoreClass = (score) => {
    if (score >= 70) return "score-low";
    if (score >= 40) return "score-medium";
    return "score-high";
  };

  const getRiskIcon = (riskLevel) => {
    if (riskLevel === "LOW RISK") return "🟢";
    if (riskLevel === "MEDIUM RISK") return "🟠";
    return "🔴";
  };

  const getRiskDescription = (riskLevel) => {
    if (riskLevel === "LOW RISK") {
      return "This job advertisement contains relatively few suspicious indicators. Still verify the company before sharing personal information.";
    }

    if (riskLevel === "MEDIUM RISK") {
      return "This advertisement contains some warning signs. Verify the company, recruiter and job details before proceeding.";
    }

    return "This advertisement contains multiple suspicious indicators. Be extremely careful and avoid sending money or sensitive personal information.";
  };

  // =====================================================
  // UI
  // =====================================================
// =====================================================
// FINAL REPORT HELPERS
// =====================================================

const getRecommendation = () => {
  if (!result) {
    return "";
  }

  if (result.trustScore >= 70) {
    return "This advertisement appears relatively safe, but always verify the employer independently before sharing sensitive information.";
  }

  if (result.trustScore >= 40) {
    return "Proceed with caution. Verify the company, recruiter and job details before accepting the opportunity.";
  }

  return "Avoid sending money or sensitive personal information. Independently verify the company and recruiter before proceeding.";
};


const getVerificationSummary = () => {
  if (!verification) {
    return "Company verification has not been performed yet.";
  }

  const messages = [];

  if (verification.websiteStatus === "ACCESSIBLE") {
    messages.push("Website is accessible");
  } else if (verification.websiteStatus === "NOT PROVIDED") {
    messages.push("Website was not provided");
  } else {
    messages.push("Website could not be verified");
  }

  if (verification.emailWebsiteMatch === true) {
    messages.push("Email domain matches website");
  } else if (
    contactEmail &&
    website &&
    verification.emailWebsiteMatch === false
  ) {
    messages.push("Email domain does not match website");
  }

  return messages.join(" • ");
};
  return (
    <div className="app">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="header">

        <div className="logo">
          🛡️ <span>TrustLens</span>
        </div>

        <p>
          AI-powered suspicious job & internship detection
        </p>

      </header>

      <main className="container">

        {/* =================================================
    PROFESSIONAL DASHBOARD
    ================================================= */}

<section className="dashboard">

  <div className="stat-card total-card">
    <div className="stat-icon">📊</div>

    <div>
      <h3>Total Analyses</h3>
      <strong>{totalAnalyses}</strong>
      <p>Jobs analyzed</p>
    </div>
  </div>


  <div className="stat-card low-card">
    <div className="stat-icon">🟢</div>

    <div>
      <h3>Low Risk</h3>
      <strong>{lowRisk}</strong>
      <p>Relatively safer</p>
    </div>
  </div>


  <div className="stat-card medium-card">
    <div className="stat-icon">🟠</div>

    <div>
      <h3>Medium Risk</h3>
      <strong>{mediumRisk}</strong>
      <p>Needs verification</p>
    </div>
  </div>


  <div className="stat-card high-card">
    <div className="stat-icon">🔴</div>

    <div>
      <h3>High Risk</h3>
      <strong>{highRisk}</strong>
      <p>Highly suspicious</p>
    </div>
  </div>


  <div className="stat-card average-card">
    <div className="stat-icon">⭐</div>

    <div>
      <h3>Average Score</h3>
      <strong>{averageScore}/100</strong>
      <p>Overall trust level</p>
    </div>
  </div>

</section>

        {/* =================================================
            ANALYZER
        ================================================= */}

        <section className="analyzer">

          <h1>
            🔎 Analyze Job Advertisement
          </h1>

          <p className="subtitle">
            Paste a job or internship advertisement below.
            TrustLens checks suspicious patterns and calculates
            a Trust Score.
          </p>

          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) =>
              setCompanyName(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Company Website"
            value={website}
            onChange={(e) =>
              setWebsite(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Recruiter Email"
            value={contactEmail}
            onChange={(e) =>
              setContactEmail(e.target.value)
            }
          />

          <textarea
            placeholder="Paste the complete job or internship advertisement here..."
            value={jobText}
            onChange={(e) =>
              setJobText(e.target.value)
            }
            rows="10"
          />

          {/* BUTTONS */}

          <div className="buttons">

            <button
              className="detect-btn"
              onClick={detectInformation}
            >
              🔍 Auto Detect Information
            </button>

            <button
  className="verify-btn"
  onClick={verifyCompany}
  disabled={verifying}
>
  {verifying
    ? "🔄 Verifying..."
    : "🔎 Verify Company"}
</button>

            <button
              className="analyze-btn"
              onClick={analyzeJob}
              disabled={loading}
            >
              {loading
                ? "🔄 Analyzing..."
                : "🔎 Analyze Job"}
            </button>

            <button
              className="clear-btn"
              onClick={clearForm}
            >
              🗑️ Clear
            </button>

          </div>

          {error && (
            <div className="error">
              ⚠️ {error}
            </div>
          )}

        </section>

        {/* =================================================
            DETECTED INFORMATION
        ================================================= */}

        {Object.values(detectedInfo).some(
          (value) => value
        ) && (

          <section className="detected-section">

            <h2>
              🔍 Detected Information
            </h2>

            <div className="detected-grid">

              {detectedInfo.company && (
                <div className="detected-card">
                  <span>🏢</span>

                  <div>
                    <small>Company</small>

                    <strong>
                      {detectedInfo.company}
                    </strong>
                  </div>
                </div>
              )}

              {detectedInfo.jobTitle && (
                <div className="detected-card">
                  <span>💼</span>

                  <div>
                    <small>Job Title</small>

                    <strong>
                      {detectedInfo.jobTitle}
                    </strong>
                  </div>
                </div>
              )}

              {detectedInfo.website && (
                <div className="detected-card">
                  <span>🌐</span>

                  <div>
                    <small>Website</small>

                    <strong>
                      {detectedInfo.website}
                    </strong>
                  </div>
                </div>
              )}

              {detectedInfo.email && (
                <div className="detected-card">
                  <span>📧</span>

                  <div>
                    <small>Email</small>

                    <strong>
                      {detectedInfo.email}
                    </strong>
                  </div>
                </div>
              )}

              {detectedInfo.phone && (
                <div className="detected-card">
                  <span>📱</span>

                  <div>
                    <small>Phone</small>

                    <strong>
                      {detectedInfo.phone}
                    </strong>
                  </div>
                </div>
              )}

              {detectedInfo.location && (
                <div className="detected-card">
                  <span>📍</span>

                  <div>
                    <small>Location</small>

                    <strong>
                      {detectedInfo.location}
                    </strong>
                  </div>
                </div>
              )}

              {detectedInfo.salary && (
                <div className="detected-card">
                  <span>💰</span>

                  <div>
                    <small>Salary</small>

                    <strong>
                      {detectedInfo.salary}
                    </strong>
                  </div>
                </div>
              )}

            </div>

          </section>
        )}


        {/* =================================================
    COMPANY VERIFICATION
    ================================================= */}

{verification && (
  <section className="verification-section">

    <h2>🔎 Company Verification</h2>

    <div className="verification-grid">

      <div className="verification-card">
        <span>🏢</span>
        <div>
          <small>Company</small>
          <strong>
            {companyName || "Not provided"}
          </strong>

          <p className="verification-status">
            {verification.companyStatus === "PROVIDED"
              ? "✓ Company name provided"
              : "⚠ Company name not provided"}
          </p>
        </div>
      </div>

      <div className="verification-card">
        <span>🌐</span>
        <div>
          <small>Website</small>

          <strong>
            {website || "Not provided"}
          </strong>

          <p className="verification-status">
            {verification.websiteStatus === "ACCESSIBLE"
              ? "✓ Website accessible"
              : verification.websiteStatus === "NOT PROVIDED"
              ? "⚠ Website not provided"
              : "⚠ Website could not be verified"}
          </p>
        </div>
      </div>

      <div className="verification-card">
        <span>📧</span>
        <div>
          <small>Recruiter Email</small>

          <strong>
            {contactEmail || "Not provided"}
          </strong>

          <p className="verification-status">
            {verification.emailStatus === "VALID FORMAT"
              ? "✓ Valid email format"
              : "⚠ Email not provided or invalid"}
          </p>
        </div>
      </div>

      {website && contactEmail && (
        <div className="verification-card">
          <span>🔗</span>

          <div>
            <small>Domain Match</small>

            <strong>
              {verification.emailWebsiteMatch
                ? "MATCH"
                : "NO MATCH"}
            </strong>

            <p className="verification-status">
              {verification.emailWebsiteMatch
                ? "✓ Email domain matches website"
                : "⚠ Email domain does not match website"}
            </p>
          </div>
        </div>
      )}

    </div>

    <div className="verification-note">
      💡 Website accessibility and email-domain matching
      are signals only. They do not prove that a company
      or job advertisement is legitimate.
    </div>

  </section>
)}

        {/* =================================================
            TRUST SCORE RESULT
        ================================================= */}

        {result && (

          <section className="result-section">

            <div className="result-header">

              <div>
                <h2>
                  🛡️ TrustLens Risk Assessment
                </h2>

                <p>
                  Analysis completed successfully
                </p>
              </div>

              <div className="result-icon">
                {getRiskIcon(result.riskLevel)}
              </div>

            </div>

            {/* SCORE */}

            <div className="score-container">

              <div
                className={`score-circle ${getScoreClass(
                  result.trustScore
                )}`}
              >

                <div className="score-number">
                  {result.trustScore}
                </div>

                <div className="score-out-of">
                  /100
                </div>

              </div>

              <div className="score-info">

                <h3>
                  Trust Score
                </h3>

                <p>
                  Higher scores indicate fewer suspicious
                  indicators.
                </p>

                <div className="score-bar">

                  <div
                    className={`score-progress ${getScoreClass(
                      result.trustScore
                    )}`}
                    style={{
                      width: `${result.trustScore}%`,
                    }}
                  ></div>

                </div>

              </div>

            </div>

            {/* RISK LEVEL */}

            <div
              className={`risk-badge ${getScoreClass(
                result.trustScore
              )}`}
            >
              {getRiskIcon(result.riskLevel)}{" "}
              {result.riskLevel}
            </div>

            {/* RISK EXPLANATION */}

            <div className="risk-explanation">

              <h3>
                💡 What does this mean?
              </h3>

              <p>
                {getRiskDescription(
                  result.riskLevel
                )}
              </p>

            </div>

            {/* RISK FACTORS */}

            <div className="risk-factors">

              <h3>
                ⚠️ Risk Factors Detected
              </h3>

              {result.riskFactors &&
                result.riskFactors
                  .split(",")
                  .map(
                    (factor, index) => (

                      <div
                        className="factor"
                        key={index}
                      >
                        ⚠️{" "}
                        {factor.trim()}
                      </div>

                    )
                  )}

            </div>

          </section>
        )}


        {/* =================================================
    FINAL TRUSTLENS REPORT
    ================================================= */}

{result && (

  <section className="final-report">

    <div className="final-report-header">

      <div>
        <h2>🛡️ TrustLens Final Report</h2>

        <p>
          Combined risk analysis and verification summary
        </p>
      </div>

      <div className="final-score-mini">
        <strong>{result.trustScore}</strong>
        <span>/100</span>
      </div>

    </div>


    {/* OVERALL STATUS */}

    <div
      className={`final-status ${getScoreClass(
        result.trustScore
      )}`}
    >

      <span className="final-status-icon">
        {getRiskIcon(result.riskLevel)}
      </span>

      <div>

        <h3>
          {result.riskLevel}
        </h3>

        <p>
          Overall Trust Score:{" "}
          <strong>
            {result.trustScore}/100
          </strong>
        </p>

      </div>

    </div>


    {/* COMPANY DETAILS */}

    <div className="report-block">

      <h3>🏢 Company Information</h3>

      <div className="report-grid">

        <div>
          <span>Company</span>
          <strong>
            {companyName || "Not provided"}
          </strong>
        </div>

        <div>
          <span>Website</span>
          <strong>
            {website || "Not provided"}
          </strong>
        </div>

        <div>
          <span>Recruiter Email</span>
          <strong>
            {contactEmail || "Not provided"}
          </strong>
        </div>

      </div>

    </div>


    {/* VERIFICATION */}

    <div className="report-block">

      <h3>🔎 Verification Summary</h3>

      <div className="verification-summary">

        {verification ? (

          <>
            <div className="summary-item">

              <span>🌐 Website</span>

              <strong>
                {verification.websiteStatus ===
                "ACCESSIBLE"
                  ? "✓ Accessible"
                  : verification.websiteStatus ===
                    "NOT PROVIDED"
                  ? "⚠ Not provided"
                  : "⚠ Could not verify"}
              </strong>

            </div>


            <div className="summary-item">

              <span>📧 Email</span>

              <strong>
                {verification.emailStatus ===
                "VALID FORMAT"
                  ? "✓ Valid format"
                  : "⚠ Not provided"}
              </strong>

            </div>


            <div className="summary-item">

              <span>🔗 Domain</span>

              <strong>
                {verification.emailWebsiteMatch
                  ? "✓ Matches website"
                  : contactEmail && website
                  ? "⚠ Does not match"
                  : "— Not available"}
              </strong>

            </div>

          </>

        ) : (

          <div className="not-verified">
            ⚠️ {getVerificationSummary()}
          </div>

        )}

      </div>

    </div>


    {/* RISK FACTORS */}

    <div className="report-block">

      <h3>⚠️ Key Risk Factors</h3>

      <div className="final-risk-list">

        {result.riskFactors &&
          result.riskFactors
            .split(",")
            .map((factor, index) => (

              <div
                className="final-risk-item"
                key={index}
              >
                <span>⚠️</span>

                <p>
                  {factor.trim()}
                </p>

              </div>

            ))}

      </div>

    </div>


    {/* RECOMMENDATION */}

    <div
      className={`recommendation ${getScoreClass(
        result.trustScore
      )}`}
    >

      <h3>🚨 TrustLens Recommendation</h3>

      <p>
        {getRecommendation()}
      </p>

    </div>


    {/* DISCLAIMER */}

    <div className="report-disclaimer">

      <strong>Important:</strong>

      <span>
        TrustLens provides an automated risk assessment.
        A risk score is not proof that a job or company is
        fraudulent. Always independently verify important
        information before making decisions.
      </span>

    </div>

  </section>

)}

        {/* =================================================
    ANALYSIS HISTORY
    ================================================= */}

<section className="history">

  <div className="history-heading">

    <div>
      <h2>📋 Analysis History</h2>

      <p>
        Review your previously analyzed job advertisements
      </p>
    </div>

    <div className="history-count">
      {history.length} Analysis
      {history.length !== 1 ? "es" : ""}
    </div>

  </div>


  {history.length === 0 ? (

    <div className="empty-history">

      <div className="empty-icon">
        📭
      </div>

      <h3>No Analysis History</h3>

      <p>
        Analyze your first job advertisement and
        the result will appear here.
      </p>

    </div>

  ) : (

    <div className="history-list">

      {history
        .slice()
        .reverse()
        .map((item) => {

          const score =
            Number(item.trustScore || 0);

          const risk =
            item.riskLevel || "UNKNOWN";

          const riskClass =
            score >= 70
              ? "green"
              : score >= 40
              ? "orange"
              : "red";

          const riskIcon =
            score >= 70
              ? "🟢"
              : score >= 40
              ? "🟠"
              : "🔴";

          return (

            <div
              className="history-card"
              key={item.id}
            >

              {/* TOP */}

              <div className="history-card-top">

                <div className="history-company">

                  <div className="company-icon">
                    🏢
                  </div>

                  <div>

                    <h3>
                      {item.companyName ||
                        "Unknown Company"}
                    </h3>

                    <span>
                      Job Advertisement Analysis
                    </span>

                  </div>

                </div>


                <div
                  className={`history-risk-badge ${riskClass}`}
                >
                  {riskIcon} {risk}
                </div>

              </div>


              {/* SCORE */}

              <div className="history-score-section">

                <div className="history-score-label">

                  <span>
                    Trust Score
                  </span>

                  <strong>
                    {score}/100
                  </strong>

                </div>

                <div className="history-score-bar">

                  <div
                    className={`history-score-progress ${riskClass}`}
                    style={{
                      width: `${score}%`,
                    }}
                  ></div>

                </div>

              </div>


              {/* DETAILS */}

              <div className="history-info-grid">

                <div>

                  <small>
                    🌐 Website
                  </small>

                  <strong>
                    {item.website ||
                      "Not provided"}
                  </strong>

                </div>


                <div>

                  <small>
                    📧 Recruiter Email
                  </small>

                  <strong>
                    {item.contactEmail ||
                      "Not provided"}
                  </strong>

                </div>

              </div>


              {/* JOB TEXT */}

              <div className="history-job">

                <small>
                  📝 Advertisement
                </small>

                <p>
                  {item.jobText
                    ? item.jobText.length > 180
                      ? item.jobText.substring(
                          0,
                          180
                        ) + "..."
                      : item.jobText
                    : "No advertisement text available."}
                </p>

              </div>


              {/* RISK FACTORS */}

              <div className="history-factors">

                <small>
                  ⚠️ Risk Factors
                </small>

                <div className="history-factor-list">

                  {item.riskFactors ? (

                    item.riskFactors
                      .split(",")
                      .slice(0, 5)
                      .map(
                        (factor, index) => (

                          <span
                            key={index}
                            className="history-factor"
                          >
                            ⚠️{" "}
                            {factor.trim()}
                          </span>

                        )
                      )

                  ) : (

                    <span className="history-factor safe">
                      ✓ No major suspicious
                      patterns detected
                    </span>

                  )}

                </div>

              </div>


              {/* BOTTOM */}

              <div className="history-bottom">

                <span className="history-id">
                  Analysis #{item.id}
                </span>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteAnalysis(item.id)
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            </div>

          );

        })}

    </div>

  )}

</section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>
        <p>
          🛡️ TrustLens — AI-powered job scam detection
        </p>
      </footer>
      </main>
    </div>
  );
}

export default App;