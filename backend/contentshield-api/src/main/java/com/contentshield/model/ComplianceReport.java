package com.contentshield.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReport {

    private int brandScore;
    private List<ComplianceFlag> legalFlags;
    private boolean piiDetected;
    private double accessibilityScore;
    private String recommendation;
    private List<String> autoFixes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplianceFlag {
        private String type;
        private String description;
        private String location;
        private String suggestedFix;
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    }
}
