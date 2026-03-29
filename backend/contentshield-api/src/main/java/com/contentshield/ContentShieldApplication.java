package com.contentshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ContentShieldApplication {
    public static void main(String[] args) {
        SpringApplication.run(ContentShieldApplication.class, args);
    }
}
