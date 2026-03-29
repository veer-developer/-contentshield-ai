package com.contentshield.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowContext {

    private String workflowId;
    private String topic;
    private String channel;
    private List<String> targetLocales;
    private List<String> briefDocumentIds;

    private String structuredBrief;
    private String contentDraft;
    private String sourceDocumentsJson;
    private List<String> mediaUrls;

    private AuthenticityReport authenticityReport;
    private ComplianceReport complianceReport;
    private Map<String, String> localizedVariants;
    private Map<String, String> publishedRecords;
    private SwarmReport swarmReport;

    private WorkflowStatus status;
    private String currentStage;
    private boolean requiresHumanReview;
    private String rejectionReason;

    public boolean isRejected() {
        return WorkflowStatus.REJECTED.equals(this.status);
    }

    public boolean requiresHumanReview() {
        return this.requiresHumanReview;
    }

    public static WorkflowContext from(ContentRequest request) {
        return WorkflowContext.builder()
                .workflowId("wf-" + System.currentTimeMillis())
                .topic(request.getTopic())
                .channel(request.getChannel())
                .targetLocales(request.getTargetLocales())
                .briefDocumentIds(request.getBriefDocumentIds())
                .status(WorkflowStatus.RUNNING)
                .currentStage("KNOWLEDGE_EXTRACTION")
                .requiresHumanReview(false)
                .build();
    }
}
