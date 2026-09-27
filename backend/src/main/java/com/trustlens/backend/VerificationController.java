package com.trustlens.backend;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/verify")
@CrossOrigin(origins = "http://localhost:5173")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(
            VerificationService verificationService) {

        this.verificationService =
                verificationService;
    }

    @PostMapping
    public Map<String, Object> verify(
            @RequestBody Map<String, String> request) {

        String website =
                request.get("website");

        String email =
                request.get("email");

        String companyName =
                request.get("companyName");

        return verificationService.verify(
                website,
                email,
                companyName
        );
    }
}