package com.esportsbuzz.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class StandingDto {

    private int rank;
    
    @JsonProperty("teamId")
    private long teamId;
    
    @JsonProperty("teamName")
    private String teamName;
    
    @JsonProperty("teamAcronym")
    private String teamAcronym;
    
    @JsonProperty("teamImageUrl")
    private String teamImageUrl;
    
    private int wins;
    private int losses;
    
    // Some endpoints may include ties or points depending on game rules
    private int ties;
    private int points;
}
