package com.esportsbuzz.pandaservice;

import com.esportsbuzz.dto.ValorantMatchDto;
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
                    team.setAcronym(teamNode.path("acronym").asText(""));
                    team.setImageUrl(teamNode.path("image_url").asText(""));
                    
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
}