package com.esportsbuzz.sched.config;

import com.esportsbuzz.dto.ValorantMatchDto;
import com.esportsbuzz.pandaservice.MatchCacheService;
import com.esportsbuzz.pandaservice.PandaScoreValorantService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.annotation.PostConstruct;
import java.util.List;

@Component
public class MatchRefreshScheduler {

    @Autowired
    private PandaScoreValorantService pandaScoreValorantService;

    @Autowired
    private MatchCacheService matchCacheService;

    @PostConstruct
    public void initialFetch() {
        refreshUpcomingMatches();
        refreshLiveMatches();
        refreshPastMatches();
    }

    @Scheduled(fixedRate = 1 * 60 * 60 * 1000) // every 1 hour
    public void refreshUpcomingMatches() {
        try {
            List<ValorantMatchDto> matches = pandaScoreValorantService.fetchFromApi(); // raw call, bypasses any Spring @Cacheable
            matchCacheService.setUpcomingMatches(matches);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Scheduled(fixedRate = 60 * 1000) // every 1 minute for live matches
    public void refreshLiveMatches() {
        try {
            List<ValorantMatchDto> matches = pandaScoreValorantService.getLiveMatches();
            matchCacheService.setLiveMatches(matches);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Scheduled(fixedRate = 1 * 60 * 60 * 1000) // every 1 hour for past matches
    public void refreshPastMatches() {
        try {
            List<ValorantMatchDto> matches = pandaScoreValorantService.getPastMatches();
            matchCacheService.setPastMatches(matches);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}