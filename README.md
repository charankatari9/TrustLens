# 🔎 TrustLens – AI-Powered Job & Internship Scam Risk Analyzer

TrustLens is a web-based job and internship scam-risk analyzer that helps users identify potentially suspicious online job advertisements.

The system analyzes job advertisements using **rule-based detection and Python-based machine learning analysis**, generates a **Trust Score**, identifies suspicious risk factors, and stores previous analyses for future reference.

---

## 📌 Problem Statement

Online job and internship platforms provide many opportunities, but fraudulent advertisements are also becoming increasingly common.

Scam job advertisements may contain warning signs such as:

- Registration or security fees
- Guaranteed jobs or income
- Unrealistic salary promises
- Urgent recruitment messages
- Requests to contact recruiters through WhatsApp or Telegram
- Requests for Aadhaar, bank, OTP, or other sensitive information
- Suspicious email addresses
- Investment or payment-related requests

Many students and job seekers may not recognize these warning signs before responding to such advertisements.

**TrustLens** aims to provide an easy-to-use system that analyzes job advertisements and highlights potentially suspicious characteristics.

---

## 🎯 Objectives

The main objectives of TrustLens are:

1. Analyze online job and internship advertisements.
2. Detect common job-scam indicators.
3. Combine rule-based and ML-based analysis.
4. Generate an easy-to-understand Trust Score.
5. Classify advertisements according to their risk level.
6. Display the factors contributing to the detected risk.
7. Store previous analyses in a PostgreSQL database.
8. Provide users with a simple and interactive web interface.

---

## ✨ Features

### 🔎 Job Advertisement Analysis

Users can paste a complete job or internship advertisement into TrustLens for analysis.

### 📊 Trust Score

The system generates a score from:

**0 – 100**

A higher score indicates fewer suspicious indicators detected by the current analysis rules.

### 🚦 Risk Classification

TrustLens classifies results into different risk categories:

- 🟢 **LOW RISK**
- 🟡 **MODERATE RISK**
- 🟠 **SUSPICIOUS**
- 🔴 **HIGH RISK**

### ⚠️ Risk Factor Detection

The system identifies suspicious patterns such as:

- Payment or registration fee requests
- Guaranteed job claims
- Guaranteed income claims
- Unrealistic salary promises
- Urgent recruitment language
- WhatsApp/Telegram recruitment
- Requests for sensitive information
- Suspicious email addresses
- Investment or cryptocurrency-related language
- Informal recruitment/contact methods

### 🧠 Machine Learning Analysis

TrustLens uses a Python-based analysis service to detect suspicious patterns in job advertisements.

### 💾 Analysis History

Previous analyses are stored in PostgreSQL and can be viewed later.

### 🗑️ History Management

Users can delete previous analysis records when required.

### 🎨 Interactive Dashboard

The React frontend provides a clean interface for:

- Entering job advertisements
- Running analysis
- Viewing Trust Scores
- Viewing risk factors
- Viewing analysis history
- Clearing the current analysis

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │        USER         │
                         │                     │
                         │ Job Advertisement   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   REACT FRONTEND    │
                         │                     │
                         │ • Job Input         │
                         │ • Analyze           │
                         │ • Trust Score       │
                         │ • Risk Factors      │
                         │ • History           │
                         └──────────┬──────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   SPRING BOOT       │
                         │      BACKEND        │
                         │                     │
                         │ • REST Controllers  │
                         │ • Risk Analysis     │
                         │ • Score Calculation │
                         │ • Database Access   │
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └─────────────┐
                    ▼                                ▼
          ┌───────────────────┐            ┌──────────────────┐
          │  PYTHON / FLASK   │            │   POSTGRESQL     │
          │    ML SERVICE     │            │    DATABASE      │
          │                   │            │                  │
          │ • Pattern         │            │ • Analysis       │
          │   Detection       │            │   History        │
          │ • Risk Analysis   │            │ • Trust Score    │
          │ • Risk Factors    │            │ • Risk Level     │
          └─────────┬─────────┘            │ • Job Details    │
                    │                      └──────────────────┘
                    ▼
          ┌───────────────────┐
          │ Analysis Results  │
          │                   │
          │ Trust Score       │
          │ Risk Level        │
          │ Risk Factors      │
          └───────────────────┘
