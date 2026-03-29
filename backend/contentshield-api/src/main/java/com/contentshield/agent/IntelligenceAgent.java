package com.contentshield.agent;

import com.contentshield.llm.LLMClient;
import com.contentshield.model.WorkflowContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class IntelligenceAgent {

    @Autowired
    private LLMClient llmClient;

    @KafkaListener(topics = "intelligence-loop", groupId = "contentshield-group")
    public void onCycleComplete(String workflowId) {
        // Async: triggered after publish via Kafka
        System.out.println("Intelligence agent processing cycle: " + workflowId);
        // In production: load context from DB, update prompt templates,
        // adjust thresholds, generate monthly compliance pattern reports
    }

    public String generateCycleSummary(WorkflowContext ctx) {
        String systemPrompt = """
                You are a content strategy intelligence analyst.
                Analyze the completed content lifecycle cycle and provide
                actionable recommendations for improvement.
                """;

        String userPrompt = String.format("""
                Analyze this content cycle:
                - Topic: %s
                - Channel: %s
                - Authenticity Score: %d
                - Compliance Flags: %d
                - Locales: %s
                - Swarm Action: %s

                Provide 3 specific recommendations to improve future cycles.
                """,
                ctx.getTopic(),
                ctx.getChannel(),
                ctx.getAuthenticityReport() != null ?
                    ctx.getAuthenticityReport().getScore() : 0,
                ctx.getComplianceReport() != null &&
                    ctx.getComplianceReport().getLegalFlags() != null ?
                    ctx.getComplianceReport().getLegalFlags().size() : 0,
                String.join(", ", ctx.getTargetLocales()),
                ctx.getSwarmReport() != null ?
                    ctx.getSwarmReport().getAction() : "N/A"
        );

        return llmClient.complete(systemPrompt, userPrompt);
    }
}
