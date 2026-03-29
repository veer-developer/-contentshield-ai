package com.contentshield.controller;

import com.contentshield.model.WorkflowContext;
import com.contentshield.model.WorkflowStatus;
import com.contentshield.orchestrator.WorkflowOrchestrator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/review")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private WorkflowOrchestrator orchestrator;

    @PostMapping("/{workflowId}/approve")
    public ResponseEntity<?> approve(
            @PathVariable String workflowId,
            @RequestBody(required = false) Map<String, String> body) {

        WorkflowContext ctx = WorkflowController.STORE.get(workflowId);
        if (ctx == null) return ResponseEntity.notFound().build();

        if (!WorkflowStatus.AWAITING_HUMAN_REVIEW.equals(ctx.getStatus())) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Workflow is not awaiting review")
            );
        }

        ctx.setStatus(WorkflowStatus.APPROVED);

        // Apply optional inline edits from reviewer
        if (body != null && body.containsKey("editedDraft")) {
            ctx.setContentDraft(body.get("editedDraft"));
        }

        ctx = orchestrator.continueAfterApproval(ctx);
        WorkflowController.STORE.put(workflowId, ctx);

        return ResponseEntity.ok(Map.of(
            "workflowId", workflowId,
            "status",     ctx.getStatus(),
            "nextStage",  "LOCALIZATION",
            "message",    "Pipeline resumed — proceeding to localization"
        ));
    }

    @PostMapping("/{workflowId}/reject")
    public ResponseEntity<?> reject(
            @PathVariable String workflowId,
            @RequestBody Map<String, String> body) {

        WorkflowContext ctx = WorkflowController.STORE.get(workflowId);
        if (ctx == null) return ResponseEntity.notFound().build();

        ctx.setStatus(WorkflowStatus.REJECTED);
        ctx.setRejectionReason(body.getOrDefault("reason", "Rejected by reviewer"));
        WorkflowController.STORE.put(workflowId, ctx);

        return ResponseEntity.ok(Map.of(
            "workflowId", workflowId,
            "status",     ctx.getStatus(),
            "reason",     ctx.getRejectionReason()
        ));
    }
}
