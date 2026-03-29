package com.contentshield.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwarmReport {

    private String contentId;
    private double swarmProbability;
    private String action; // MONITOR, ALERT, ESCALATE
    private SwarmSignals signals;
    private List<String> autoActions;
    private long detectedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SwarmSignals {
        private int suspiciousReposts;
        private double accountAgePct;
        private double geographicConcentration;
        private double botSignatureMatch;
        private double contentMutationPct;
        private double velocityMultiplier;
    }
}
