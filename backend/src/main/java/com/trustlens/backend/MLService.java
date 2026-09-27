package com.trustlens.backend;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MLService {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String ML_URL =
            "http://localhost:5000/analyze";

    public Map<String, Object> analyzeJob(String jobText) {

        // Send job text to Python ML service
        Map<String, String> request = Map.of(
                "text", jobText
        );

        Map<String, Object> result = restTemplate.postForObject(
                ML_URL,
                request,
                Map.class
        );

        if (result == null) {
            throw new RuntimeException(
                    "ML service returned no response"
            );
        }

        // ==========================================
        // GET EXISTING ML RESULT
        // ==========================================

        int trustScore = 100;

        Object scoreObject = result.get("trustScore");

        if (scoreObject instanceof Number) {
            trustScore = ((Number) scoreObject).intValue();
        }

        // ==========================================
        // EXISTING RISK FACTORS
        // ==========================================

        Set<String> factors = new LinkedHashSet<>();

        Object factorsObject = result.get("riskFactors");

        if (factorsObject instanceof List<?>) {

            for (Object factor : (List<?>) factorsObject) {

                if (factor != null) {
                    factors.add(factor.toString());
                }
            }

        } else if (factorsObject != null) {

            factors.add(factorsObject.toString());
        }

        // ==========================================
        // NORMALIZE TEXT
        // ==========================================

        String text = jobText == null
                ? ""
                : jobText.toLowerCase();

        // ==========================================
        // RULE 1: PAYMENT / REGISTRATION FEE
        // ==========================================

        if (containsAny(
                text,
                "registration fee",
                "joining fee",
                "processing fee",
                "security fee",
                "application fee",
                "pay ₹",
                "pay rs",
                "pay inr",
                "payment required",
                "pay money"
        )) {

            factors.add(
                    "Payment or registration fee requested"
            );

            trustScore -= 25;
        }

        // ==========================================
        // RULE 2: WHATSAPP / TELEGRAM
        // ==========================================

        if (containsAny(
                text,
                "whatsapp",
                "telegram"
        )) {

            factors.add(
                    "Recruitment communication through WhatsApp or Telegram"
            );

            trustScore -= 10;
        }

        // ==========================================
        // RULE 3: URGENT LANGUAGE
        // ==========================================

        if (containsAny(
                text,
                "urgent hiring",
                "urgent job",
                "urgent requirement",
                "apply immediately",
                "apply now",
                "limited vacancies",
                "limited seats",
                "act now"
        )) {

            factors.add(
                    "Urgent or pressure-based recruitment language"
            );

            trustScore -= 10;
        }

        // ==========================================
        // RULE 4: GUARANTEED JOB / INCOME
        // ==========================================

        if (containsAny(
                text,
                "guaranteed job",
                "guaranteed income",
                "100% job guarantee",
                "job guarantee",
                "guaranteed placement",
                "guaranteed salary"
        )) {

            factors.add(
                    "Guaranteed job or income claim"
            );

            trustScore -= 20;
        }

        // ==========================================
        // RULE 5: UNREALISTIC SALARY
        // ==========================================

        if (containsAny(
                text,
                "₹1 lakh",
                "₹2 lakh",
                "₹3 lakh",
                "1 lakh per month",
                "2 lakh per month",
                "3 lakh per month",
                "100000 per month",
                "200000 per month",
                "50000 per week",
                "1 lakh per week"
        )) {

            factors.add(
                    "Potentially unrealistic salary claim"
            );

            trustScore -= 15;
        }

        // ==========================================
        // RULE 6: SENSITIVE INFORMATION
        // ==========================================

        if (containsAny(
                text,
                "otp",
                "one time password",
                "bank pin",
                "banking password",
                "atm pin",
                "credit card number",
                "debit card number",
                "password"
        )) {

            factors.add(
                    "Request for sensitive personal or banking information"
            );

            trustScore -= 30;
        }

        // ==========================================
        // RULE 7: NO EXPERIENCE + HIGH PAY
        // ==========================================

        boolean noExperience = containsAny(
                text,
                "no experience required",
                "without experience",
                "fresher can apply",
                "freshers welcome"
        );

        boolean highPay = containsAny(
                text,
                "₹50000",
                "₹60000",
                "₹70000",
                "₹80000",
                "₹90000",
                "₹1 lakh",
                "1 lakh per month"
        );

        if (noExperience && highPay) {

            factors.add(
                    "No experience requirement combined with unusually high pay"
            );

            trustScore -= 15;
        }

        // ==========================================
        // RULE 8: FREE / EASY MONEY CLAIMS
        // ==========================================

        if (containsAny(
                text,
                "easy money",
                "earn money easily",
                "quick money",
                "work 1 hour",
                "earn from home",
                "make money fast"
        )) {

            factors.add(
                    "Easy-money or quick-income claim"
            );

            trustScore -= 10;
        }

        // ==========================================
        // RULE 9: SUSPICIOUS LINK
        // ==========================================

        if (containsAny(
                text,
                "bit.ly/",
                "tinyurl.com/",
                "shorturl.at/",
                "t.me/"
        )) {

            factors.add(
                    "Shortened or potentially suspicious link detected"
            );

            trustScore -= 15;
        }

        // ==========================================
        // KEEP SCORE BETWEEN 0 AND 100
        // ==========================================

        trustScore = Math.max(
                0,
                Math.min(100, trustScore)
        );

        // ==========================================
        // DETERMINE RISK LEVEL
        // ==========================================

        String riskLevel;

        if (trustScore >= 70) {

            riskLevel = "LOW RISK";

        } else if (trustScore >= 40) {

            riskLevel = "MEDIUM RISK";

        } else {

            riskLevel = "HIGH RISK";
        }

        // ==========================================
        // UPDATE RESULT
        // ==========================================

        result.put(
                "trustScore",
                trustScore
        );

        result.put(
                "riskLevel",
                riskLevel
        );

        result.put(
                "riskFactors",
                new ArrayList<>(factors)
        );

        return result;
    }

    // ==========================================
    // HELPER METHOD
    // ==========================================

    private boolean containsAny(
            String text,
            String... keywords) {

        for (String keyword : keywords) {

            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }
}