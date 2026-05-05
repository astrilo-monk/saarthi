package com.saarthi.chatbot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * College entity - maps email domains to institutions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class College {
    private String id;
    private String name;
    private String domain;  // e.g. "bppimt.ac.in"
}
