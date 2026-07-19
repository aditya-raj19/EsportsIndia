package com.esportsbuzz.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentDto {
    private long id;
    private String name;
    private String status;
    private String beginAt;
    private String endAt;
    private String tier;
    private String prizepool;
    private String region;
    
    // Videogame info
    @JsonProperty("videogameName")
    private String videogameName;
    
    // League info
    @JsonProperty("leagueId")
    private long leagueId;
    
    @JsonProperty("leagueName")
    private String leagueName;
    
    @JsonProperty("leagueImageUrl")
    private String leagueImageUrl;

    private List<TeamDto> teams;
    private List<MatchDto> matches;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamDto {
        private long teamId;
        private String name;
        private String acronym;
        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchDto {
        private long id;
        private String name;
        private String status;
        private String beginAt;
        private String endAt;
        private String scheduledAt;
        private String matchType;
        private int numberOfGames;
    }
}
