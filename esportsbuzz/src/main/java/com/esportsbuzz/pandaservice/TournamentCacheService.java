package com.esportsbuzz.pandaservice;

import com.esportsbuzz.dto.TournamentDto;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TournamentCacheService {

    private final Map<String, List<TournamentDto>> tournamentCache = new ConcurrentHashMap<>();

    public List<TournamentDto> getTournaments(String game, String status) {
        if (game == null || status == null) return Collections.emptyList();
        String key = game.toLowerCase() + "_" + status.toLowerCase();
        return tournamentCache.getOrDefault(key, Collections.emptyList());
    }

    public void setTournaments(String game, String status, List<TournamentDto> tournaments) {
        if (game == null || status == null || tournaments == null) return;
        String key = game.toLowerCase() + "_" + status.toLowerCase();
        tournamentCache.put(key, tournaments);
    }
}
