package com.contentshield.agent;

import com.contentshield.llm.LLMClient;
import com.contentshield.model.ComplianceReport;
import com.contentshield.model.WorkflowContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ComplianceAgent {

    @Autowired
    private LLMClient llmClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WorkflowContext review(WorkflowContext ctx) {
        ctx.setCurrentStage("COMPLIANCE_REVIEW");

        String systemPrompt = """
                You are an enterprise compliance and legal review expert.
                Review content for brand, legal, and regulatory compliance.
                Return valid JSON only.
                """;

        String userPrompt = String.format("""
                CHANNEL: %s

                CONTENT DRAFT:
                %s

                Check for:
                1. Brand voice violations (tone, prohibited words, competitor mentions)
                2. Legal flags (unverified superlatives, missing disclaimers, PII)
                3. Regulatory issues (GDPR, financial claims, health claims)
                4. Accessibility (reading level, alt-text requirements)

                Return JSON:
                {
                  "brandScore": <0-100>,
                  "recommendation": "<APPROVE|REVIEW|REJECT>",
                  "piiDetected": <true|false>,
                  "accessibilityScore": <0-100>,
                  "legalFlags": [
                    {
                      "type": "<BRAND|LEGAL|REGULATORY|ACCESSIBILITY>",
                      "description": "<description>",
                      "location": "<sentence or line>",
                      "suggestedFix": "<fix>",
                      "severity": "<LOW|MEDIUM|HIGH|CRITICAL>"
                    }
                  ],
                  "autoFixes": ["<fix applied>"]
                }
                """,
                ctx.getChannel(),
                ctx.getContentDraft()
        );

        try {
            String response = llmClient.completeJson(systemPrompt, userPrompt);
            ComplianceReport report = objectMapper.readValue(response, ComplianceReport.class);
            ctx.setComplianceReport(report);

            boolean hasHighFlags = report.getLegalFlags() != null &&
                report.getLegalFlags().stream()
                    .anyMatch(f -> "HIGH".equals(f.getSeverity()) ||
                                  "CRITICAL".equals(f.getSeverity()));

            ctx.setRequiresHumanReview(hasHighFlags);

        } catch (Exception e) {
            ctx.setRequiresHumanReview(true);
        }

        return ctx;
    }
}
