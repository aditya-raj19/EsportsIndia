package com.esportsbuzz.sched.config;

import com.esportsbuzz.pandaservice.MatchCacheService;
import com.esportsbuzz.pandaservice.PandaScoreValorantService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.annotation.PostConstruct;

@Component
public class MatchRefreshScheduler {

    @Autowired
    private PandaScoreValorantService pandaScoreValorantService;

    @Autowired
    private MatchCacheService matchCacheService;

    @PostConstruct
    public void initialFetch() {
        refreshUpcomingMatches();
    }

    @Scheduled(fixedRate = 1 * 60 * 60 * 1000) // every 6 hours
    public void refreshUpcomingMatches() {
        var matches = pandaScoreValorantService.fetchFromApi(); // raw call, bypasses any Spring @Cacheable
        matchCacheService.setUpcomingMatches(matches);
    }
}