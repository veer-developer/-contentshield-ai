package com.contentshield.orchestrator;

import com.contentshield.agent.*;
import com.contentshield.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class WorkflowOrchestrator {

    @Autowired private KnowledgeAgent knowledgeAgent;
    @Autowired private ContentGeneratorAgent contentGeneratorAgent;
    @Autowired private AuthenticityAgent authenticityAgent;
    @Autowired private ComplianceAgent complianceAgent;
    @Autowired private LocalizationAgent localizationAgent;
    @Autowired private DistributionAgent distributionAgent;
    @Autowired private KafkaTemplate<String, String> kafkaTemplate;

    public WorkflowContext runPipeline(ContentRequest request) {
        WorkflowContext ctx = WorkflowContext.from(request);

        // Stage 1 — Knowledge Extraction
        ctx = knowledgeAgent.extract(ctx);
        System.out.println("[Stage 1] Knowledge extracted");

        // Stage 2 — Content Generation
        ctx = contentGeneratorAgent.generate(ctx);
        System.out.println("[Stage 2] Content generated");

        // Stage 3 — Authenticity Verification (CORE)
        ctx = authenticityAgent.verify(ctx);
        System.out.println("[Stage 3] Authenticity score: " +
            (ctx.getAuthenticityReport() != null ?
             ctx.getAuthenticityReport().getScore() : "N/A"));

        if (ctx.isRejected()) {
            System.out.println("[HALT] Pipeline rejected: " + ctx.getRejectionReason());
            return ctx;
        }

        // Stage 4 — Compliance Review
        ctx = complianceAgent.review(ctx);
        System.out.println("[Stage 4] Compliance reviewed. Human review needed: " +
            ctx.isRequiresHumanReview());

        // Stage 5 — Human Checkpoint (if needed)
        if (ctx.requiresHumanReview()) {
            ctx.setStatus(WorkflowStatus.AWAITING_HUMAN_REVIEW);
            System.out.println("[PAUSE] Awaiting human review...");
            return ctx;
        }

        return continueAfterApproval(ctx);
    }

    public WorkflowContext continueAfterApproval(WorkflowContext ctx) {
        // Stage 5 — Localization
        ctx = localizationAgent.localize(ctx);
        System.out.println("[Stage 5] Localized to " +
            ctx.getLocalizedVariants().size() + " locales");

        // Stage 6 — Distribution
        ctx = distributionAgent.publish(ctx);
        ctx.setStatus(WorkflowStatus.COMPLETED);
        System.out.println("[Stage 6] Published to " +
            ctx.getPublishedRecords().size() + " channels");

        // Stages 7 & 8 — Async post-publish
        try {
            kafkaTemplate.send("swarm-detection", ctx.getWorkflowId());
            kafkaTemplate.send("intelligence-loop", ctx.getWorkflowId());
            System.out.println("[Async] Swarm + Intelligence agents triggered");
        } catch (Exception e) {
            System.err.println("Async agent trigger failed: " + e.getMessage());
        }

        return ctx;
    }
}
