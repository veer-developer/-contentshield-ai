package com.contentshield.agent;

import com.contentshield.llm.LLMClient;
import com.contentshield.model.WorkflowContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ContentGeneratorAgent {

    @Autowired
    private LLMClient llmClient;

    public WorkflowContext generate(WorkflowContext ctx) {
        ctx.setCurrentStage("CONTENT_GENERATION");

        String systemPrompt = """
                You are an expert enterprise content writer.
                Generate professional content based on the brief provided.
                CRITICAL: Tag every factual claim with [source_id] from the brief.
                Never invent statistics. Use only facts from the brief.
                """;

        String userPrompt = String.format("""
                Brief: %s

                Source documents available: %s

                Write a %s post. Requirements:
                - Every factual claim must have [source_id] citation
                - Professional tone
                - Under 300 words
                - End with a clear call to action
                """,
                ctx.getStructuredBrief(),
                ctx.getSourceDocumentsJson(),
                ctx.getChannel()
        );

        String draft = llmClient.complete(systemPrompt, userPrompt);
        ctx.setContentDraft(draft);

        return ctx;
    }
}
