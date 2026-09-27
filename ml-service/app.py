from flask import Flask, request, jsonify
import re

app = Flask(__name__)


# =========================================================
# TRUSTLENS JOB ANALYSIS ENGINE
# =========================================================

def analyze_job(text):
    original_text = text
    text = text.lower()

    risk_points = 0
    factors = []

    # =====================================================
    # 1. PAYMENT / MONEY REQUEST
    # =====================================================

    payment_words = [
        "registration fee",
        "registration fees",
        "application fee",
        "joining fee",
        "processing fee",
        "security deposit",
        "training fee",
        "pay ₹",
        "pay rs",
        "payment required",
        "pay money",
        "send money",
        "deposit money",
        "refundable fee"
    ]

    payment_found = False

    for word in payment_words:
        if word in text:
            payment_found = True
            break

    if payment_found:
        risk_points += 30
        factors.append(
            "Payment or registration fee requested"
        )

    # =====================================================
    # 2. WHATSAPP / TELEGRAM CONTACT
    # =====================================================

    if "whatsapp" in text:
        risk_points += 15
        factors.append(
            "WhatsApp contact detected"
        )

    if "telegram" in text:
        risk_points += 15
        factors.append(
            "Telegram contact detected"
        )

    # =====================================================
    # 3. URGENCY / PRESSURE LANGUAGE
    # =====================================================

    urgency_words = [
        "urgent",
        "immediately",
        "limited vacancies",
        "limited openings",
        "apply now",
        "act now",
        "hurry",
        "last date",
        "join today",
        "join immediately"
    ]

    urgency_found = []

    for word in urgency_words:
        if word in text:
            urgency_found.append(word)

    if urgency_found:
        risk_points += 10
        factors.append(
            "Urgent or pressure-based recruitment language detected"
        )

    # =====================================================
    # 4. GUARANTEED INCOME
    # =====================================================

    guaranteed_words = [
        "guaranteed salary",
        "guaranteed income",
        "guaranteed earnings",
        "100% guaranteed",
        "guaranteed job",
        "guaranteed placement"
    ]

    if any(word in text for word in guaranteed_words):
        risk_points += 20
        factors.append(
            "Guaranteed income or job claim detected"
        )

    # =====================================================
    # 5. NO EXPERIENCE + HIGH SALARY
    # =====================================================

    no_experience = (
        "no experience" in text
        or "without experience" in text
        or "freshers welcome" in text
        or "fresher" in text
    )

    high_salary = False

    salary_patterns = [
        r"₹\s?1\s?lakh",
        r"₹\s?2\s?lakh",
        r"₹\s?[1-9]\s?lakh",
        r"1\s?lakh\s?per\s?month",
        r"2\s?lakh\s?per\s?month",
        r"\b[1-9]\d?\s?lpa\b",
        r"\b[1-9]\d?\s?lakhs?\b"
    ]

    for pattern in salary_patterns:
        if re.search(pattern, text):
            high_salary = True
            break

    if no_experience and high_salary:
        risk_points += 20
        factors.append(
            "Potentially unrealistic salary for a no-experience role"
        )

    # =====================================================
    # 6. SUSPICIOUS JOB CLAIMS
    # =====================================================

    suspicious_claims = [
        "work from home earn",
        "earn money easily",
        "earn thousands daily",
        "earn lakhs",
        "easy money",
        "part time income",
        "make money fast",
        "get rich",
        "guaranteed placement"
    ]

    if any(claim in text for claim in suspicious_claims):
        risk_points += 15
        factors.append(
            "Unrealistic or suspicious earning claim detected"
        )

    # =====================================================
    # 7. SUSPICIOUS CONTACT METHODS
    # =====================================================

    suspicious_contact = [
        "contact only on whatsapp",
        "contact us only on whatsapp",
        "message us on whatsapp",
        "contact only on telegram",
        "dm us",
        "send your documents on whatsapp"
    ]

    if any(word in text for word in suspicious_contact):
        risk_points += 15
        factors.append(
            "Unusual or informal recruitment contact method detected"
        )

    # =====================================================
    # 8. EMAIL DETECTION
    # =====================================================

    emails = re.findall(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        original_text
    )

    if emails:
        suspicious_email_domains = [
            "gmail.com",
            "yahoo.com",
            "hotmail.com",
            "outlook.com",
            "protonmail.com"
        ]

        for email in emails:
            email_lower = email.lower()

            for domain in suspicious_email_domains:
                if email_lower.endswith("@" + domain):
                    risk_points += 10
                    factors.append(
                        "Recruiter uses a personal email domain"
                    )
                    break

            break

    # =====================================================
    # 9. WEBSITE CHECK
    # =====================================================

    websites = re.findall(
        r"https?://[^\s<>\"]+",
        original_text
    )

    if not websites:
        risk_points += 5
        factors.append(
            "No company website detected in advertisement"
        )

    # =====================================================
    # 10. DOCUMENT / ID REQUEST
    # =====================================================

    sensitive_requests = [
        "send aadhaar",
        "send your aadhaar",
        "send pan card",
        "send your pan",
        "send bank details",
        "share bank account",
        "send passport",
        "send otp",
        "share otp"
    ]

    if any(word in text for word in sensitive_requests):
        risk_points += 25
        factors.append(
            "Sensitive personal or financial information requested"
        )

    # =====================================================
    # 11. CRYPTO / INVESTMENT REQUEST
    # =====================================================

    financial_words = [
        "crypto payment",
        "bitcoin payment",
        "investment required",
        "invest money",
        "trading account",
        "deposit cryptocurrency"
    ]

    if any(word in text for word in financial_words):
        risk_points += 25
        factors.append(
            "Unusual financial or investment request detected"
        )

    # =====================================================
    # 12. CALCULATE TRUST SCORE
    # =====================================================

    risk_points = min(risk_points, 100)

    trust_score = max(
        0,
        100 - risk_points
    )

    # =====================================================
    # 13. RISK LEVEL
    # =====================================================

    if trust_score >= 70:
        risk_level = "LOW RISK"

    elif trust_score >= 40:
        risk_level = "MEDIUM RISK"

    else:
        risk_level = "HIGH RISK"

    # =====================================================
    # 14. NO RISK FACTORS
    # =====================================================

    if not factors:
        factors.append(
            "No major suspicious patterns detected"
        )

    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {
        "trustScore": trust_score,
        "riskLevel": risk_level,
        "riskFactors": factors
    }


# =========================================================
# ANALYZE API
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({
            "error": "Job advertisement text is required"
        }), 400

    text = data["text"]

    if not isinstance(text, str):
        return jsonify({
            "error": "Text must be a string"
        }), 400

    if not text.strip():
        return jsonify({
            "error": "Job advertisement text cannot be empty"
        }), 400

    result = analyze_job(text)

    return jsonify(result)


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ML service is running"
    })


# =========================================================
# START FLASK SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )