package com.contentshield.agent;

import com.contentshield.llm.LLMClient;
import com.contentshield.model.WorkflowContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeAgent {

    @Autowired
    private LLMClient llmClient;

    public WorkflowContext extract(WorkflowContext ctx) {
        ctx.setCurrentStage("KNOWLEDGE_EXTRACTION");

        String systemPrompt = """
                You are an enterprise knowledge extraction expert.
                Extract structured facts from the provided documents and create
                a content brief. Return valid JSON only.
                """;

        String userPrompt = String.format("""
                Topic: %s
                Channel: %s
                Document IDs available: %s

                Create a structured JSON brief:
                {
                  "topic": "...",
                  "audience": "...",
                  "tone": "...",
                  "keyFacts": ["fact1", "fact2"],
                  "forbiddenClaims": ["claim1"],
                  "brandGuidelines": "...",
                  "channel": "...",
                  "wordLimit": 300
                }
                """,
                ctx.getTopic(),
                ctx.getChannel(),
                String.join(", ", ctx.getBriefDocumentIds())
        );

        String brief = llmClient.completeJson(systemPrompt, userPrompt);
        ctx.setStructuredBrief(brief);
        ctx.setSourceDocumentsJson(buildSampleSourceDocs());

        return ctx;
    }

    private String buildSampleSourceDocs() {
        return """
                [
                  {"id": "q3-earnings-p4", "content": "Q3 revenue grew 34% year over year."},
                  {"id": "case-study-bank-2024", "content": "Client reduced content cycle time by 12 days."},
                  {"id": "brand-guidelines", "content": "Never use competitor names without disclaimer."},
                  {"id": "product-specs", "content": "Platform reduces hallucination risk by 96%."}
                ]
                """;
    }
}
