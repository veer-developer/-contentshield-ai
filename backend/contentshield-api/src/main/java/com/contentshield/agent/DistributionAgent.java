package com.contentshield.agent;

import com.contentshield.model.WorkflowContext;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class DistributionAgent {

    public WorkflowContext publish(WorkflowContext ctx) {
        ctx.setCurrentStage("DISTRIBUTION");

        Map<String, String> publishedRecords = new HashMap<>();

        ctx.getLocalizedVariants().forEach((locale, content) -> {
            String contentId = publishToChannel(ctx.getChannel(), locale, content);
            publishedRecords.put(locale, contentId);
        });

        ctx.setPublishedRecords(publishedRecords);
        return ctx;
    }

    private String publishToChannel(String channel, String locale, String content) {
        // In production: call real CMS / social APIs
        // LinkedIn API, WordPress REST, Mailchimp, Contentful, etc.
        String contentId = channel.toLowerCase() + "-" +
                           locale + "-" +
                           UUID.randomUUID().toString().substring(0, 8);

        System.out.println("Published to " + channel +
            " [" + locale + "]: " + contentId +
            " at " + Instant.now());

        return contentId;
    }
}
