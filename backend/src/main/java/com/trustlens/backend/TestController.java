package com.trustlens.backend;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trustlens.backend.entity.Analysis;
import com.trustlens.backend.repository.AnalysisRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class TestController {

    @Autowired
private MLService mlService;

@PostMapping("/ml-analyze")
public Map<String, Object> mlAnalyze(
        @RequestBody Map<String, String> request) {

    String jobText = request.get("jobText");

    return mlService.analyzeJob(jobText);
}

    private final AnalysisRepository analysisRepository;

    public TestController(AnalysisRepository analysisRepository) {
        this.analysisRepository = analysisRepository;
    }

    // Test API
    @GetMapping("/test")
    public String test() {
        return "TrustLens Backend is running!";
    }

    // Analyze job advertisement
    @PostMapping("/analyze")
    public AnalysisResult analyze(@RequestBody JobRequest request) {

        String jobText = request.getJobText();
        String companyName = request.getCompanyName();
        String website = request.getWebsite();
        String contactEmail = request.getContactEmail();

        if (jobText == null) {
            jobText = "";
        }

        if (companyName == null) {
            companyName = "";
        }

        if (website == null) {
            website = "";
        }

        if (contactEmail == null) {
            contactEmail = "";
        }

        String text = jobText.toLowerCase();

        int riskPoints = 0;
        List<String> factors = new ArrayList<>();

        // =========================
        // JOB TEXT ANALYSIS
        // =========================

        if (text.contains("registration fee")) {
            riskPoints += 25;
            factors.add("Registration fee detected");
        }

        if (text.contains("training fee")) {
            riskPoints += 15;
            factors.add("Training fee detected");
        }

        if (text.contains("security deposit") ||
                text.contains("deposit")) {

            riskPoints += 20;
            factors.add("Security deposit detected");
        }

        if (text.contains("payment") ||
                text.contains("pay ₹") ||
                text.contains("pay rs") ||
                text.contains("pay inr")) {

            riskPoints += 15;
            factors.add("Payment request detected");
        }

        if (text.contains("guaranteed job") ||
                text.contains("guaranteed placement")) {

            riskPoints += 15;
            factors.add("Guaranteed job/placement claim detected");
        }

        if (text.contains("no interview") ||
                text.contains("without interview") ||
                text.contains("no interview required")) {

            riskPoints += 10;
            factors.add("No-interview claim detected");
        }

        if (text.contains("urgent") ||
                text.contains("immediately") ||
                text.contains("act now")) {

            riskPoints += 5;
            factors.add("Urgent recruitment language detected");
        }

        if (text.contains("whatsapp")) {
            riskPoints += 5;
            factors.add("WhatsApp contact detected");
        }

        if (text.contains("telegram")) {
            riskPoints += 5;
            factors.add("Telegram contact detected");
        }

        if (text.contains("dm me") ||
        text.contains("direct message me") ||
        text.contains("message me privately")) {

    riskPoints += 5;
    factors.add("Private messaging recruitment pattern detected");
}

        if (text.contains("bank account") ||
                text.contains("bank details") ||
                text.contains("credit card") ||
                text.contains("debit card") ||
                text.contains("otp")) {

            riskPoints += 20;
            factors.add("Sensitive financial information request detected");
        }

        if (text.contains("₹1 lakh") ||
                text.contains("₹2 lakh") ||
                text.contains("₹3 lakh") ||
                text.contains("1 lakh per month") ||
                text.contains("2 lakh per month") ||
                text.contains("3 lakh per month")) {

            riskPoints += 10;
            factors.add("Potentially unrealistic salary claim detected");
        }


        // =========================
// SALARY ANALYSIS
// =========================

if (text.contains("guaranteed salary") ||
        text.contains("guaranteed income")) {

    riskPoints += 10;
    factors.add("Guaranteed income claim detected");
}

if (text.contains("earn ₹") ||
        text.contains("earn rs") ||
        text.contains("earn inr") ||
        text.contains("earn 1 lakh") ||
        text.contains("earn 2 lakh")) {

    riskPoints += 10;
    factors.add("Potentially unrealistic earning claim detected");
}

if (text.contains("work from home") &&
        (text.contains("₹50,000") ||
         text.contains("₹1 lakh") ||
         text.contains("50,000 per month") ||
         text.contains("1 lakh per month"))) {

    riskPoints += 15;
    factors.add("High salary combined with work-from-home claim");
}

// =========================
// SUSPICIOUS WORDING
// =========================

if (text.contains("limited vacancies") ||
        text.contains("limited seats") ||
        text.contains("only today") ||
        text.contains("apply now") ||
        text.contains("last chance")) {

    riskPoints += 5;
    factors.add("Pressure/urgency language detected");
}

if (text.contains("no experience required") &&
        (text.contains("high salary") ||
         text.contains("huge salary") ||
         text.contains("guaranteed income"))) {

    riskPoints += 10;
    factors.add("Unrealistic combination of no experience and high income");
}

if (text.contains("easy money") ||
        text.contains("quick money") ||
        text.contains("make money fast")) {

    riskPoints += 15;
    factors.add("Easy/quick money claim detected");
}

        // =========================
        // COMPANY ANALYSIS
        // =========================

        if (companyName.trim().isEmpty()) {

            riskPoints += 10;
            factors.add("Company name not provided");

        } else if (companyName.length() < 3) {

            riskPoints += 5;
            factors.add("Company name appears incomplete");
        }

        // =========================
        // WEBSITE ANALYSIS
        // =========================

        if (website.trim().isEmpty()) {

            riskPoints += 10;
            factors.add("Company website not provided");

        } else {

            String lowerWebsite = website.toLowerCase();

            if (!lowerWebsite.startsWith("http://") &&
                    !lowerWebsite.startsWith("https://")) {

                riskPoints += 5;
                factors.add("Website does not use a standard URL format");
            }

            if (lowerWebsite.contains("bit.ly") ||
                    lowerWebsite.contains("tinyurl") ||
                    lowerWebsite.contains("goo.gl")) {

                riskPoints += 15;
                factors.add("URL shortener detected");
            }
        }

        // =========================
        // EMAIL ANALYSIS
        // =========================

        if (contactEmail.trim().isEmpty()) {

            riskPoints += 5;
            factors.add("Contact email not provided");

        } else {

            String lowerEmail = contactEmail.toLowerCase();

            if (lowerEmail.endsWith("@gmail.com") ||
                    lowerEmail.endsWith("@yahoo.com") ||
                    lowerEmail.endsWith("@outlook.com") ||
                    lowerEmail.endsWith("@hotmail.com")) {

                riskPoints += 5;
                factors.add("Personal email provider used instead of company domain");
            }
        }


        // =========================
// DOMAIN ANALYSIS
// =========================

if (!website.trim().isEmpty()) {

    String lowerWebsite = website.toLowerCase().trim();

    // HTTPS check
    if (lowerWebsite.startsWith("http://")) {

        riskPoints += 5;
        factors.add("Website does not use HTTPS");

    }

    // Free hosting / suspicious domains
    if (lowerWebsite.contains("blogspot.com") ||
            lowerWebsite.contains("wordpress.com") ||
            lowerWebsite.contains("weebly.com") ||
            lowerWebsite.contains("wixsite.com") ||
            lowerWebsite.contains("github.io")) {

        riskPoints += 5;
        factors.add("Website uses a free hosting/subdomain service");
    }

    // Suspicious URL patterns
    if (lowerWebsite.contains("job") &&
            (lowerWebsite.contains("offer") ||
             lowerWebsite.contains("apply") ||
             lowerWebsite.contains("verify"))) {

        riskPoints += 5;
        factors.add("Website contains suspicious recruitment URL pattern");
    }

    // IP address instead of domain
    if (lowerWebsite.matches(".*https?://\\d+\\.\\d+\\.\\d+\\.\\d+.*")) {

        riskPoints += 15;
        factors.add("Website uses an IP address instead of a domain name");
    }
}


// =========================
// EMAIL / DOMAIN MATCH
// =========================

if (!contactEmail.trim().isEmpty() &&
        !website.trim().isEmpty()) {

    String emailDomain = "";

    if (contactEmail.contains("@")) {
        emailDomain =
                contactEmail.substring(
                        contactEmail.lastIndexOf("@") + 1
                ).toLowerCase().trim();
    }

    String websiteDomain = website
            .toLowerCase()
            .replace("https://", "")
            .replace("http://", "")
            .replace("www.", "");

    if (websiteDomain.contains("/")) {
        websiteDomain =
                websiteDomain.substring(
                        0,
                        websiteDomain.indexOf("/")
                );
    }

    if (!emailDomain.isEmpty() &&
            !websiteDomain.isEmpty() &&
            !emailDomain.equals(websiteDomain) &&
            !emailDomain.equals("gmail.com") &&
            !emailDomain.equals("yahoo.com") &&
            !emailDomain.equals("outlook.com") &&
            !emailDomain.equals("hotmail.com")) {

        riskPoints += 10;
        factors.add(
                "Contact email domain does not match company website"
        );
    }
}

        // =========================
        // SCORE
        // =========================

        if (riskPoints > 100) {
            riskPoints = 100;
        }

        int trustScore = 100 - riskPoints;

        String riskLevel;

        if (trustScore >= 80) {
            riskLevel = "LOW RISK";
        } else if (trustScore >= 60) {
            riskLevel = "MODERATE RISK";
        } else if (trustScore >= 40) {
            riskLevel = "SUSPICIOUS";
        } else {
            riskLevel = "HIGH RISK";
        }

        // Convert factors to database string
        String riskFactors = String.join(", ", factors);

        // =========================
        // SAVE TO DATABASE
        // =========================

        Analysis analysis = new Analysis(
                jobText,
                companyName,
                website,
                contactEmail,
                trustScore,
                riskLevel,
                riskFactors
        );

        analysisRepository.save(analysis);

        // =========================
        // RETURN RESULT
        // =========================

        return new AnalysisResult(
                trustScore,
                riskLevel,
                factors
        );
    }

    // =========================
    // HISTORY
    // =========================

    @GetMapping("/history")
    public List<Analysis> getHistory() {
        return analysisRepository.findAll();
    }

    // =========================
    // DELETE HISTORY
    // =========================

    @DeleteMapping("/history/{id}")
    public String deleteAnalysis(@PathVariable Long id) {

        if (analysisRepository.existsById(id)) {

            analysisRepository.deleteById(id);

            return "Analysis deleted successfully";
        }

        return "Analysis not found";
    }

    // =========================
    // JOB REQUEST
    // =========================

    public static class JobRequest {

        private String jobText;
        private String companyName;
        private String website;
        private String contactEmail;

        public JobRequest() {
        }

        public String getJobText() {
            return jobText;
        }

        public void setJobText(String jobText) {
            this.jobText = jobText;
        }

        public String getCompanyName() {
            return companyName;
        }

        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }

        public String getWebsite() {
            return website;
        }

        public void setWebsite(String website) {
            this.website = website;
        }

        public String getContactEmail() {
            return contactEmail;
        }

        public void setContactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
        }
    }

    // =========================
    // ANALYSIS RESULT
    // =========================

    public static class AnalysisResult {

        private int trustScore;
        private String riskLevel;
        private List<String> factors;

        public AnalysisResult(
                int trustScore,
                String riskLevel,
                List<String> factors) {

            this.trustScore = trustScore;
            this.riskLevel = riskLevel;
            this.factors = factors;
        }

        public int getTrustScore() {
            return trustScore;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public List<String> getFactors() {
            return factors;
        }
    }
}