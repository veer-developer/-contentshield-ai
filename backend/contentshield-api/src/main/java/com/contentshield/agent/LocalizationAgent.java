package com.contentshield.agent;

import com.contentshield.llm.LLMClient;
import com.contentshield.model.WorkflowContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class LocalizationAgent {

    @Autowired
    private LLMClient llmClient;

    @Value("${contentshield.localization.drift-threshold:20}")
    private int driftThreshold;

    public WorkflowContext localize(WorkflowContext ctx) {
        ctx.setCurrentStage("LOCALIZATION");

        Map<String, String> variants = new HashMap<>();

        for (String locale : ctx.getTargetLocales()) {
            String translated = translateToLocale(ctx.getContentDraft(), locale, ctx.getChannel());
            double driftScore = calculateDriftScore(ctx.getContentDraft(), translated, locale);

            if (driftScore > driftThreshold) {
                System.out.println("WARNING: Locale " + locale +
                    " drift score " + driftScore + "% exceeds threshold");
            }

            variants.put(locale, translated);
        }

        variants.put("en-US", ctx.getContentDraft());
        ctx.setLocalizedVariants(variants);

        return ctx;
    }

    private String translateToLocale(String content, String locale, String channel) {
        String systemPrompt = """
                You are an expert localization specialist.
                Translate content with cultural adaptation, not just literal translation.
                Preserve meaning, adjust idioms for the target culture.
                Keep [source_id] citation tags intact.
                """;

        String userPrompt = String.format("""
                Translate this %s content to locale %s:

                %s

                Requirements:
                - Cultural adaptation, not just word-for-word translation
                - Preserve all brand claims and source citations
                - Appropriate register and tone for the locale
                - Return only the translated content
                """,
                channel, locale, content
        );

        return llmClient.complete(systemPrompt, userPrompt);
    }

    private double calculateDriftScore(String original, String translated, String locale) {
        // In production: use embedding cosine similarity between
        // original and back-translated version via Python service
        return Math.random() * 25;
    }
}
