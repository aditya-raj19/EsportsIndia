package com.esportsbuzz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValorantMatchDto {
    private String matchId;
    private String matchName;
    private String status;
    private String beginAt;
    private String leagueName;
    private String tournamentName;
    private String serieName;
    private String videogameName;
    private int numberOfGames;
    private String streamUrl; // keeping for backward compatibility
    private List<StreamDto> streams;
    private List<TeamDto> teams;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StreamDto {
        private String rawUrl;
        private String language;
        private boolean isMain;
        private boolean isOfficial;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamDto {
        private long teamId;
        private String name;
        private String acronym;
        private String imageUrl;
        private Integer score;
    }
}