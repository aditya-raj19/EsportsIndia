package com.esportsbuzz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpcomingMatchDto {
    private String matchId;
    private String matchName;
    private String status;
    private String beginAt;
    private String leagueName;
    private String tournamentName;
    private String serieName;
    private String videogameName;
    private int numberOfGames;
    private String streamUrl;
    private List<TeamDto> teams;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamDto {
        private long teamId;
        private String name;
        private String acronym;
        private String imageUrl;
    }
}