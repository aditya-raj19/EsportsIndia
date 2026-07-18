package com.esportsbuzz.pandaservice;

import com.esportsbuzz.dto.UpcomingMatchDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
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

    public List<UpcomingMatchDto> getUpcomingMatches() {
        String url = baseUrl + "/valorant/matches/upcoming?page[size]=20";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        return mapToUpcomingMatches(response.getBody());
    }

    public List<UpcomingMatchDto> fetchFromApi() {
        String url = baseUrl + "/valorant/matches/upcoming?page[size]=20";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
        );

        return mapToUpcomingMatches(response.getBody());
    }

    private List<UpcomingMatchDto> mapToUpcomingMatches(String json) {
        List<UpcomingMatchDto> matches = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);

            for (JsonNode matchNode : root) {
                UpcomingMatchDto dto = new UpcomingMatchDto();
                dto.setMatchId(matchNode.path("id").asText());
                dto.setMatchName(matchNode.path("name").asText(""));
                dto.setStatus(matchNode.path("status").asText(""));
                dto.setBeginAt(matchNode.path("begin_at").asText(""));
                dto.setLeagueName(matchNode.path("league").path("name").asText("Unknown League"));
                dto.setTournamentName(matchNode.path("tournament").path("name").asText(""));
                dto.setSerieName(matchNode.path("serie").path("full_name").asText(""));
                dto.setVideogameName(matchNode.path("videogame").path("name").asText(""));
                dto.setNumberOfGames(matchNode.path("number_of_games").asInt(0));

                // grab the main/official stream if available
                JsonNode streams = matchNode.path("streams_list");
                String mainStreamUrl = "";
                for (JsonNode stream : streams) {
                    if (stream.path("main").asBoolean(false)) {
                        mainStreamUrl = stream.path("raw_url").asText("");
                        break;
                    }
                }
                    dto.setStreamUrl(mainStreamUrl);

                // teams from opponents array
                List<UpcomingMatchDto.TeamDto> teams = new ArrayList<>();
                JsonNode opponents = matchNode.path("opponents");
                for (JsonNode opp : opponents) {
                    JsonNode teamNode = opp.path("opponent");
                    UpcomingMatchDto.TeamDto team = new UpcomingMatchDto.TeamDto();
                    team.setTeamId(teamNode.path("id").asLong());
                    team.setName(teamNode.path("name").asText("TBD"));
                    team.setAcronym(teamNode.path("acronym").asText(""));
                    team.setImageUrl(teamNode.path("image_url").asText(""));
                    teams.add(team);
                }
                dto.setTeams(teams);

                matches.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace(); // swap for a real logger
        }
        return matches;
    }
}