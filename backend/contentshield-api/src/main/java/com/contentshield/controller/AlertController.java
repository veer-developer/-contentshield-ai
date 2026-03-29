package com.contentshield.controller;

import com.contentshield.agent.SwarmDetectionAgent;
import com.contentshield.model.SwarmReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private SwarmDetectionAgent swarmDetectionAgent;

    @GetMapping("/swarm")
    public ResponseEntity<?> getSwarmAlerts(
            @RequestParam(required = false) String contentId,
            @RequestParam(required = false) String since) {

        String id = (contentId != null) ? contentId : "demo-content-001";
        SwarmReport report = swarmDetectionAgent.detect(id);

        return ResponseEntity.ok(Map.of(
            "alerts",    List.of(report),
            "total",     1,
            "generated", System.currentTimeMillis()
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "ContentShield Alert Service"));
    }
}
