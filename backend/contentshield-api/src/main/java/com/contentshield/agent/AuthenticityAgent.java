package com.contentshield.agent;

import com.contentshield.llm.LLMClient;
import com.contentshield.model.AuthenticityReport;
import com.contentshield.model.WorkflowContext;
import com.contentshield.model.WorkflowStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthenticityAgent {

    @Autowired
    private LLMClient llmClient;

    @Value("${contentshield.authenticity.rejection-threshold:40}")
    private int rejectionThreshold;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WorkflowContext verify(WorkflowContext ctx) {
        ctx.setCurrentStage("AUTHENTICITY_VERIFICATION");
        long startTime = System.currentTimeMillis();

        String systemPrompt = """
                You are an enterprise content verification expert.
                Verify every factual claim in the draft against source documents.
                Return valid JSON matching the AuthenticityReport schema exactly.
                """;

        String userPrompt = String.format("""
                CHANNEL: %s

                DRAFT:
                %s

                SOURCE DOCUMENTS:
                %s

                For each factual claim:
                1. Find which source supports it (or flag as UNSOURCED)
                2. Verify the source actually supports the claim
                3. Flag extreme statistics as IMPLAUSIBLE
                4. Flag outdated data

                Return JSON:
                {
                  "score": <0-100>,
                  "overallRecommendation": "<APPROVE|REVIEW|REJECT>",
                  "claimResults": [
                    {
                      "claim": "<exact claim text>",
                      "sourceId": "<source id or null>",
                      "verdict": "<VERIFIED|CONTRADICTED|UNSOURCED|IMPLAUSIBLE>",
                      "explanation": "<brief explanation>",
                      "correctedValue": "<corrected value if CONTRADICTED, else null>",
                      "confidence": <0.0-1.0>
                    }
                  ],
                  "metadataFlags": {
                    "imageOrigin": "INTERNAL_S3",
                    "c2paSignal": "CLEAN",
                    "generativeWatermark": "NOT_DETECTED"
                  }
                }
                """,
                ctx.getChannel(),
                ctx.getContentDraft(),
                ctx.getSourceDocumentsJson()
        );

        try {
            String response = llmClient.completeJson(systemPrompt, userPrompt);
            AuthenticityReport report = objectMapper.readValue(response, AuthenticityReport.class);
            report.setProcessingTimeMs((int)(System.currentTimeMillis() - startTime));
            ctx.setAuthenticityReport(report);

            if (report.getScore() < rejectionThreshold) {
                ctx.setStatus(WorkflowStatus.REJECTED);
                ctx.setRejectionReason(
                    "Authenticity score " + report.getScore() +
                    " below minimum threshold " + rejectionThreshold
                );
            }

        } catch (Exception e) {
            ctx.setStatus(WorkflowStatus.FAILED);
            ctx.setRejectionReason("Authenticity check failed: " + e.getMessage());
        }

        return ctx;
    }
}
