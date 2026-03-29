package com.contentshield.agent;

import com.contentshield.model.SwarmReport;
import com.contentshield.model.WorkflowContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class SwarmDetectionAgent {

    @Value("${contentshield.swarm.probability-alert:0.5}")
    private double alertThreshold;

    @Value("${contentshield.swarm.probability-escalate:0.7}")
    private double escalateThreshold;

    private final Random random = new Random();

    @KafkaListener(topics = "swarm-detection", groupId = "contentshield-group")
    public void onPublishedContent(String workflowId) {
        // Async: triggered after publish via Kafka
        System.out.println("Swarm detection started for workflow: " + workflowId);
        SwarmReport report = detect(workflowId);
        System.out.println("Swarm result: " + report.getAction() +
            " (probability: " + report.getSwarmProbability() + ")");
    }

    public SwarmReport detect(String contentId) {
        // Simulated detection signals
        // In production: pull real engagement data from LinkedIn, Twitter APIs
        double accountAgePct      = 0.85 + random.nextDouble() * 0.14;
        double geoConcPct         = 0.80 + random.nextDouble() * 0.19;
        double botSignaturePct    = 0.60 + random.nextDouble() * 0.30;
        double mutationPct        = 0.20 + random.nextDouble() * 0.40;
        double velocityMultiplier = 5.0  + random.nextDouble() * 5.0;
        int suspiciousReposts     = 400  + random.nextInt(600);

        double swarmProbability = calculateSwarmProbability(
            accountAgePct, geoConcPct, botSignaturePct,
            mutationPct, velocityMultiplier
        );

        String action = swarmProbability >= escalateThreshold ? "ESCALATE"
                      : swarmProbability >= alertThreshold    ? "ALERT"
                      : "MONITOR";

        List<String> autoActions = buildAutoActions(action, contentId);

        SwarmReport.SwarmSignals signals = new SwarmReport.SwarmSignals(
            suspiciousReposts, accountAgePct, geoConcPct,
            botSignaturePct, mutationPct, velocityMultiplier
        );

        return new SwarmReport(
            contentId, swarmProbability, action,
            signals, autoActions, System.currentTimeMillis()
        );
    }

    private double calculateSwarmProbability(
            double accountAge, double geoConc, double botSig,
            double mutation, double velocity) {
        return Math.min(1.0,
            (accountAge * 0.30) +
            (geoConc    * 0.25) +
            (botSig     * 0.25) +
            (mutation   * 0.10) +
            (Math.min(velocity / 15.0, 1.0) * 0.10)
        );
    }

    private List<String> buildAutoActions(String action, String contentId) {
        List<String> actions = new ArrayList<>();
        if ("ESCALATE".equals(action) || "ALERT".equals(action)) {
            actions.add("Platform abuse report filed: LinkedIn ref CS-" +
                        contentId.substring(0, Math.min(8, contentId.length())));
            actions.add("Security team notified via Slack #brand-alerts");
            actions.add("Legal hold initiated on engagement evidence");
        }
        if ("ESCALATE".equals(action)) {
            actions.add("Content flagged for 5-min interval monitoring");
            actions.add("Executive escalation email triggered");
        }
        return actions;
    }
}
