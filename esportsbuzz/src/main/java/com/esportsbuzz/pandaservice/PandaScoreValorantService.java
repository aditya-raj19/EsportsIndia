package com.esportsbuzz.pandaservice;

import com.esportsbuzz.dto.ValorantMatchDto;
import com.esportsbuzz.dto.TournamentDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class PandaScoreValorantService {

    @Value("${pandascore.api.key}")
    private String apiKey;

    @Value("${pandascore.api.baseurl}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ValorantMatchDto> getUpcomingMatches() {
        String url = baseUrl + "/valorant/matches/upcoming?page[size]=20";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        return parseMatches(response.getBody());
    }

    public List<ValorantMatchDto> getLiveMatches() {
        String url = baseUrl + "/valorant/matches/running?page[size]=20";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        List<ValorantMatchDto> matches = parseMatches(response.getBody());
        
        // MOCK FOR TESTING: If there are no live matches, fetch a past match and pretend it's live
        if (matches.isEmpty()) {
            String pastUrl = baseUrl + "/valorant/matches/past?page[size]=2";
            ResponseEntity<String> pastResponse = restTemplate.exchange(
                    pastUrl, HttpMethod.GET, entity, String.class
            );
            matches = parseMatches(pastResponse.getBody());
            for (ValorantMatchDto match : matches) {
                match.setStatus("running");
            }
        }
        
        return matches;
    }

    public List<ValorantMatchDto> getPastMatches() {
        String url = baseUrl + "/valorant/matches/past?page[size]=20";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        return parseMatches(response.getBody());
    }

    public List<ValorantMatchDto> fetchFromApi() {
        String url = baseUrl + "/valorant/matches/upcoming?page[size]=20";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        return parseMatches(response.getBody());
    }

    /**
     * Generic method to fetch matches for any game and status.
     * @param game  Frontend slug: valorant, cs2, lol, dota2, pubg
     * @param status  PandaScore match status: "upcoming", "running", or "past"
     */
    public List<ValorantMatchDto> getMatchesByGame(String game, String status) {
        String apiGame = game.toLowerCase();
        if ("cs2".equals(apiGame)) {
            apiGame = "csgo"; // PandaScore uses csgo slug
        }

        String url;
        if ("all".equalsIgnoreCase(game)) {
            // Note: the /matches/running endpoint is used for 'all' games if status=running
            url = baseUrl + "/matches/" + status + "?page[size]=20";
        } else {
            url = baseUrl + "/" + apiGame + "/matches/" + status + "?page[size]=20";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );
            return parseMatches(response.getBody());
        } catch (Exception e) {
            System.err.println("Error fetching " + status + " matches for " + game + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private List<ValorantMatchDto> parseMatches(String json) {
        List<ValorantMatchDto> matches = new ArrayList<>();
        if (json == null || json.trim().isEmpty()) {
            return matches;
        }
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root == null || !root.isArray()) {
                return matches;
            }
            for (JsonNode matchNode : root) {
                ValorantMatchDto dto = new ValorantMatchDto();
                dto.setMatchId(matchNode.path("id").asText());
                dto.setMatchName(matchNode.path("name").asText(""));
                dto.setStatus(matchNode.path("status").asText(""));
                dto.setBeginAt(matchNode.path("begin_at").asText(""));
                dto.setLeagueName(matchNode.path("league").path("name").asText("Unknown League"));
                dto.setTournamentName(matchNode.path("tournament").path("name").asText(""));
                dto.setSerieName(matchNode.path("serie").path("full_name").asText(""));
                dto.setVideogameName(matchNode.path("videogame").path("name").asText(""));
                dto.setNumberOfGames(matchNode.path("number_of_games").asInt(0));

                String mainStreamUrl = matchNode.path("live_url").isNull() ? "" : matchNode.path("live_url").asText("");
                if (mainStreamUrl.isEmpty() || "null".equalsIgnoreCase(mainStreamUrl)) {
                    mainStreamUrl = matchNode.path("official_stream_url").isNull() ? "" : matchNode.path("official_stream_url").asText("");
                }
                if ("null".equalsIgnoreCase(mainStreamUrl)) {
                    mainStreamUrl = "";
                }

                List<ValorantMatchDto.StreamDto> streams = new ArrayList<>();
                for (JsonNode stream : matchNode.path("streams_list")) {
                    String rawUrl = stream.path("raw_url").isNull() ? "" : stream.path("raw_url").asText("");
                    if (rawUrl.isEmpty() || "null".equalsIgnoreCase(rawUrl)) {
                        rawUrl = stream.path("embed_url").isNull() ? "" : stream.path("embed_url").asText("");
                    }
                    if (rawUrl.isEmpty() || "null".equalsIgnoreCase(rawUrl)) continue;

                    // Convert Twitch player embed URL (player.twitch.tv/?channel=name) to raw twitch URL (twitch.tv/name)
                    if (rawUrl.contains("player.twitch.tv") && rawUrl.contains("channel=")) {
                        String channel = rawUrl.substring(rawUrl.indexOf("channel=") + 8);
                        if (channel.contains("&")) {
                            channel = channel.substring(0, channel.indexOf("&"));
                        }
                        if (!channel.isEmpty()) {
                            rawUrl = "https://www.twitch.tv/" + channel;
                        }
                    }

                    ValorantMatchDto.StreamDto s = new ValorantMatchDto.StreamDto();
                    s.setRawUrl(rawUrl);
                    s.setLanguage(stream.path("language").asText("en"));
                    s.setMain(stream.path("main").asBoolean(false));
                    s.setOfficial(stream.path("official").asBoolean(false));
                    streams.add(s);

                    if (stream.path("main").asBoolean(false) && mainStreamUrl.isEmpty()) {
                        mainStreamUrl = rawUrl;
                    }
                }

                if (mainStreamUrl.isEmpty() && !streams.isEmpty()) {
                    mainStreamUrl = streams.get(0).getRawUrl();
                }

                if (!mainStreamUrl.isEmpty() && streams.isEmpty()) {
                    ValorantMatchDto.StreamDto s = new ValorantMatchDto.StreamDto();
                    s.setRawUrl(mainStreamUrl);
                    s.setLanguage("en");
                    s.setMain(true);
                    s.setOfficial(true);
                    streams.add(s);
                }

                dto.setStreams(streams);
                dto.setStreamUrl(mainStreamUrl);

                List<ValorantMatchDto.TeamDto> teams = new ArrayList<>();
                JsonNode opponents = matchNode.path("opponents");
                JsonNode results = matchNode.path("results");
                
                for (JsonNode opp : opponents) {
                    JsonNode teamNode = opp.path("opponent");
                    long teamId = teamNode.path("id").asLong();
                    
                    ValorantMatchDto.TeamDto team = new ValorantMatchDto.TeamDto();
                    team.setTeamId(teamId);
                    team.setName(teamNode.path("name").asText("TBD"));
                    team.setAcronym(teamNode.path("acronym").isNull() ? "" : teamNode.path("acronym").asText(""));
                    team.setImageUrl(teamNode.path("image_url").isNull() ? "" : teamNode.path("image_url").asText(""));
                    
                    if (results != null && !results.isMissingNode() && results.isArray()) {
                        for (JsonNode res : results) {
                            if (res.path("team_id").asLong() == teamId) {
                                team.setScore(res.path("score").asInt(0));
                                break;
                            }
                        }
                    }

                    // Fallback: If score is 0, count won games in games array
                    if (team.getScore() == 0 && matchNode.has("games") && matchNode.path("games").isArray()) {
                        int wonGames = 0;
                        for (JsonNode gameNode : matchNode.path("games")) {
                            if (gameNode.path("winner").path("id").asLong() == teamId) {
                                wonGames++;
                            }
                        }
                        if (wonGames > 0) {
                            team.setScore(wonGames);
                        }
                    }

                    teams.add(team);
                }
                dto.setTeams(teams);
                matches.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return matches;
    }
    /**
     * Fetches ALL currently live matches across every game (Valorant, CS2, LoL, Dota2, etc.)
     * from PandaScore's /matches/running endpoint.
     */
    public List<ValorantMatchDto> getAllLiveMatches() {
        String url = baseUrl + "/matches/running?page[size]=20";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );
            return parseMatches(response.getBody());
        } catch (Exception e) {
            System.err.println("Error fetching all live matches: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }



    public List<TournamentDto> getTournaments(String game, String status) {
        // e.g. /valorant/tournaments/running or /tournaments/running for all
        String url;
        if ("all".equalsIgnoreCase(game)) {
            url = baseUrl + "/tournaments/" + status;
        } else {
            String apiGame = game.toLowerCase();
            if ("cs2".equals(apiGame)) {
                apiGame = "csgo"; // PandaScore uses csgo slug instead of cs2
            }
            url = baseUrl + "/" + apiGame + "/tournaments/" + status;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        return parseTournaments(response.getBody());
    }

    private List<TournamentDto> parseTournaments(String json) {
        List<TournamentDto> tournaments = new ArrayList<>();
        if (json == null || json.trim().isEmpty()) {
            return tournaments;
        }

        try {
            JsonNode root = objectMapper.readTree(json);
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    TournamentDto dto = new TournamentDto();
                    dto.setId(node.path("id").asLong());
                    dto.setName(node.path("name").asText("Unknown"));
                    dto.setBeginAt(node.path("begin_at").asText(null));
                    dto.setEndAt(node.path("end_at").asText(null));
                    dto.setTier(node.path("tier").asText(null));
                    dto.setPrizepool(node.path("prizepool").asText(null));
                    
                    JsonNode videogameNode = node.path("videogame");
                    if (!videogameNode.isMissingNode() && !videogameNode.isNull()) {
                        dto.setVideogameName(videogameNode.path("name").asText(null));
                    }

                    JsonNode leagueNode = node.path("league");
                    if (!leagueNode.isMissingNode() && !leagueNode.isNull()) {
                        dto.setLeagueId(leagueNode.path("id").asLong());
                        dto.setLeagueName(leagueNode.path("name").asText("Unknown League"));
                        dto.setLeagueImageUrl(leagueNode.path("image_url").isNull() ? null : leagueNode.path("image_url").asText(null));
                    }

                    List<TournamentDto.TeamDto> teams = new ArrayList<>();
                    JsonNode teamsNode = node.path("teams");
                    if (!teamsNode.isMissingNode() && teamsNode.isArray()) {
                        for (JsonNode teamNode : teamsNode) {
                            TournamentDto.TeamDto team = new TournamentDto.TeamDto();
                            team.setTeamId(teamNode.path("id").asLong());
                            team.setName(teamNode.path("name").asText("Unknown Team"));
                            team.setAcronym(teamNode.path("acronym").isNull() ? null : teamNode.path("acronym").asText(null));
                            team.setImageUrl(teamNode.path("image_url").isNull() ? null : teamNode.path("image_url").asText(null));
                            teams.add(team);
                        }
                    }
                    dto.setTeams(teams);

                    List<TournamentDto.MatchDto> matches = new ArrayList<>();
                    JsonNode matchesNode = node.path("matches");
                    if (!matchesNode.isMissingNode() && matchesNode.isArray()) {
                        for (JsonNode matchNode : matchesNode) {
                            TournamentDto.MatchDto match = new TournamentDto.MatchDto();
                            match.setId(matchNode.path("id").asLong());
                            match.setName(matchNode.path("name").asText("Unknown Match"));
                            match.setStatus(matchNode.path("status").asText(null));
                            match.setBeginAt(matchNode.path("begin_at").asText(null));
                            match.setEndAt(matchNode.path("end_at").asText(null));
                            match.setScheduledAt(matchNode.path("scheduled_at").asText(null));
                            match.setMatchType(matchNode.path("match_type").asText(null));
                            match.setNumberOfGames(matchNode.path("number_of_games").asInt(0));
                            matches.add(match);
                        }
                    }
                    dto.setMatches(matches);
                    tournaments.add(dto);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return tournaments;
    }

    public List<com.esportsbuzz.dto.StandingDto> getTournamentStandings(long tournamentId) {
        String url = baseUrl + "/tournaments/" + tournamentId + "/standings";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        return parseStandings(response.getBody());
    }

    private List<com.esportsbuzz.dto.StandingDto> parseStandings(String json) {
        List<com.esportsbuzz.dto.StandingDto> standings = new ArrayList<>();
        if (json == null || json.trim().isEmpty()) {
            return standings;
        }

        try {
            JsonNode root = objectMapper.readTree(json);
            if (root != null && root.isArray()) {
                for (JsonNode node : root) {
                    com.esportsbuzz.dto.StandingDto dto = new com.esportsbuzz.dto.StandingDto();
                    dto.setRank(node.path("rank").asInt(0));
                    
                    JsonNode teamNode = node.path("team");
                    if (!teamNode.isMissingNode() && !teamNode.isNull()) {
                        dto.setTeamId(teamNode.path("id").asLong(0));
                        dto.setTeamName(teamNode.path("name").asText("Unknown Team"));
                        dto.setTeamAcronym(teamNode.path("acronym").isNull() ? null : teamNode.path("acronym").asText(null));
                        dto.setTeamImageUrl(teamNode.path("image_url").isNull() ? null : teamNode.path("image_url").asText(null));
                    }
                    
                    dto.setWins(node.path("wins").asInt(0));
                    dto.setLosses(node.path("losses").asInt(0));
                    dto.setTies(node.path("ties").asInt(0));
                    dto.setPoints(node.path("points").asInt(0));
                    
                    standings.add(dto);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return standings;
    }
}