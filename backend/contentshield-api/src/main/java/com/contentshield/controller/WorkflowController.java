package com.contentshield.controller;

import com.contentshield.model.ContentRequest;
import com.contentshield.model.WorkflowContext;
import com.contentshield.orchestrator.WorkflowOrchestrator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/workflow")
@CrossOrigin(origins = "*")
public class WorkflowController {

    @Autowired
    private WorkflowOrchestrator orchestrator;

    // Shared in-memory store (use Redis in production)
    public static final Map<String, WorkflowContext> STORE = new ConcurrentHashMap<>();

    @PostMapping("/start")
    public ResponseEntity<?> startWorkflow(@RequestBody ContentRequest request) {
        WorkflowContext ctx = orchestrator.runPipeline(request);
        STORE.put(ctx.getWorkflowId(), ctx);
        return ResponseEntity.ok(Map.of(
            "workflowId",            ctx.getWorkflowId(),
            "status",                ctx.getStatus(),
            "stage",                 ctx.getCurrentStage(),
            "humanReviewRequired",   ctx.isRequiresHumanReview()
        ));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getStatus(@PathVariable String id) {
        WorkflowContext ctx = STORE.get(id);
        if (ctx == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of(
            "workflowId",       ctx.getWorkflowId(),
            "status",           ctx.getStatus(),
            "stage",            ctx.getCurrentStage(),
            "authenticityScore",
                ctx.getAuthenticityReport() != null ?
                ctx.getAuthenticityReport().getScore() : 0
        ));
    }

    @GetMapping("/{id}/authenticity-report")
    public ResponseEntity<?> getAuthenticityReport(@PathVariable String id) {
        WorkflowContext ctx = STORE.get(id);
        if (ctx == null) return ResponseEntity.notFound().build();
        if (ctx.getAuthenticityReport() == null)
            return ResponseEntity.ok(Map.of("message", "Report not yet available"));
        return ResponseEntity.ok(ctx.getAuthenticityReport());
    }

    @GetMapping("/{id}/localization")
    public ResponseEntity<?> getLocalization(@PathVariable String id) {
        WorkflowContext ctx = STORE.get(id);
        if (ctx == null) return ResponseEntity.notFound().build();
        if (ctx.getLocalizedVariants() == null)
            return ResponseEntity.ok(Map.of("message", "Localization not yet complete"));
        return ResponseEntity.ok(ctx.getLocalizedVariants());
    }
}
