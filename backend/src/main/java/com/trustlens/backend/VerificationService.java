package com.trustlens.backend;

import java.net.URI;
import java.net.HttpURLConnection;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class VerificationService {

    public Map<String, Object> verify(
            String website,
            String email,
            String companyName) {

        Map<String, Object> result = new HashMap<>();

        boolean websiteProvided =
                website != null && !website.trim().isEmpty();

        boolean emailProvided =
                email != null && !email.trim().isEmpty();

        boolean companyProvided =
                companyName != null && !companyName.trim().isEmpty();

        result.put("companyProvided", companyProvided);
        result.put("websiteProvided", websiteProvided);
        result.put("emailProvided", emailProvided);

        // ---------------------------------------------
        // WEBSITE CHECK
        // ---------------------------------------------

        if (!websiteProvided) {

            result.put("websiteStatus", "NOT PROVIDED");
            result.put(
                    "websiteMessage",
                    "No company website was provided."
            );

        } else {

            try {

                String url = website.trim();

                if (!url.startsWith("http://")
                        && !url.startsWith("https://")) {

                    url = "https://" + url;
                }

                URI uri = new URI(url);

                HttpURLConnection connection =
                        (HttpURLConnection)
                                uri.toURL().openConnection();

                connection.setRequestMethod("HEAD");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                connection.setInstanceFollowRedirects(true);

                int statusCode =
                        connection.getResponseCode();

                if (statusCode >= 200
                        && statusCode < 400) {

                    result.put(
                            "websiteStatus",
                            "ACCESSIBLE"
                    );

                    result.put(
                            "websiteMessage",
                            "The website responded successfully."
                    );

                } else {

                    result.put(
                            "websiteStatus",
                            "UNAVAILABLE"
                    );

                    result.put(
                            "websiteMessage",
                            "The website returned HTTP status "
                                    + statusCode
                    );
                }

                result.put(
                        "websiteStatusCode",
                        statusCode
                );

                connection.disconnect();

            } catch (Exception e) {

                result.put(
                        "websiteStatus",
                        "UNREACHABLE"
                );

                result.put(
                        "websiteMessage",
                        "The website could not be reached."
                );
            }
        }

        // ---------------------------------------------
        // EMAIL DOMAIN CHECK
        // ---------------------------------------------

        if (emailProvided) {

            String emailDomain =
                    extractDomain(email);

            result.put(
                    "emailDomain",
                    emailDomain
            );

            if (emailDomain.isEmpty()) {

                result.put(
                        "emailStatus",
                        "INVALID"
                );

            } else {

                result.put(
                        "emailStatus",
                        "VALID FORMAT"
                );
            }

            // Compare website domain with email domain
            if (websiteProvided
                    && !emailDomain.isEmpty()) {

                String websiteDomain =
                        extractDomain(website);

                result.put(
                        "websiteDomain",
                        websiteDomain
                );

                boolean domainMatch =
                        websiteDomain.equalsIgnoreCase(
                                emailDomain
                        );

                result.put(
                        "emailWebsiteMatch",
                        domainMatch
                );

                if (domainMatch) {

                    result.put(
                            "emailMessage",
                            "Recruiter email domain matches the website domain."
                    );

                } else {

                    result.put(
                            "emailMessage",
                            "Recruiter email domain does not match the website domain."
                    );
                }

            } else {

                result.put(
                        "emailWebsiteMatch",
                        false
                );
            }

        } else {

            result.put(
                    "emailStatus",
                    "NOT PROVIDED"
            );
        }

        // ---------------------------------------------
        // COMPANY CHECK
        // ---------------------------------------------

        if (companyProvided) {

            result.put(
                    "companyStatus",
                    "PROVIDED"
            );

            result.put(
                    "companyMessage",
                    "Company name was provided for analysis."
            );

        } else {

            result.put(
                    "companyStatus",
                    "NOT PROVIDED"
            );

            result.put(
                    "companyMessage",
                    "No company name was provided."
            );
        }

        return result;
    }


    // ---------------------------------------------
    // EXTRACT DOMAIN
    // ---------------------------------------------

    private String extractDomain(String value) {

        try {

            String input = value.trim();

            if (input.contains("@")) {

                return input
                        .substring(
                                input.lastIndexOf("@") + 1
                        )
                        .toLowerCase();
            }

            if (!input.startsWith("http://")
                    && !input.startsWith("https://")) {

                input = "https://" + input;
            }

            URI uri = new URI(input);

            String host = uri.getHost();

            if (host == null) {
                return "";
            }

            if (host.startsWith("www.")) {
                host = host.substring(4);
            }

            return host.toLowerCase();

        } catch (Exception e) {

            return "";
        }
    }
}