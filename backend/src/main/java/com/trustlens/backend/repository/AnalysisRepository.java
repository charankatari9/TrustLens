package com.trustlens.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trustlens.backend.entity.Analysis;

public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
}