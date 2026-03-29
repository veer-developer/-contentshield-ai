package com.contentshield.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticityReport {

    private int score;
    private String overallRecommendation;
    private List<ClaimResult> claimResults;
    private MetadataFlags metadataFlags;
    private int processingTimeMs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClaimResult {
        private String claim;
        private String sourceId;
        private String verdict; // VERIFIED, CONTRADICTED, UNSOURCED, IMPLAUSIBLE
        private String explanation;
        private String correctedValue;
        private double confidence;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetadataFlags {
        private String imageOrigin;
        private String c2paSignal;
        private String generativeWatermark;
    }
}
