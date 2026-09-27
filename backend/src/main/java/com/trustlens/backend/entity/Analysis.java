package com.trustlens.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "analyses")
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String jobText;

    private String companyName;

    private String website;

    private String contactEmail;

    private int trustScore;

    private String riskLevel;

    @Column(columnDefinition = "TEXT")
    private String riskFactors;

    public Analysis() {
    }

    public Analysis(
        String jobText,
        String companyName,
        String website,
        String contactEmail,
        int trustScore,
        String riskLevel,
        String riskFactors) {

    this.jobText = jobText;
    this.companyName = companyName;
    this.website = website;
    this.contactEmail = contactEmail;
    this.trustScore = trustScore;
    this.riskLevel = riskLevel;
    this.riskFactors = riskFactors;
}

    public Long getId() {
        return id;
    }

    public String getJobText() {
        return jobText;
    }

    public void setJobText(String jobText) {
        this.jobText = jobText;
    }

    public int getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(int trustScore) {
        this.trustScore = trustScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRiskFactors() {
        return riskFactors;
    }

    public void setRiskFactors(String riskFactors) {
        this.riskFactors = riskFactors;
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