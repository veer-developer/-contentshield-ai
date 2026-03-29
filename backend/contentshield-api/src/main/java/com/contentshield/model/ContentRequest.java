package com.contentshield.model;

import lombok.Data;
import java.util.List;

@Data
public class ContentRequest {
    private String topic;
    private String channel;
    private List<String> targetLocales;
    private List<String> briefDocumentIds;
}
