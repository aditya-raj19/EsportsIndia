package com.esportsbuzz.pandaservice;

import com.esportsbuzz.dto.ValorantMatchDto;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Component
public class MatchCacheService {

    private volatile List<ValorantMatchDto> upcomingMatches = Collections.emptyList();
    private volatile Instant lastUpdated = null;
    private volatile List<ValorantMatchDto> liveMatches = Collections.emptyList();


    public List<ValorantMatchDto> getUpcomingMatches() {
        return upcomingMatches;
    }

    public void setUpcomingMatches(List<ValorantMatchDto> matches) {
        this.upcomingMatches = matches;
        this.lastUpdated = Instant.now();
    }

    public List<ValorantMatchDto> getLiveMatches() {
        return liveMatches;
    }

    public void setLiveMatches(List<ValorantMatchDto> matches) {
        this.liveMatches = matches;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    private volatile List<ValorantMatchDto> pastMatches = Collections.emptyList();

    public List<ValorantMatchDto> getPastMatches() {
        return pastMatches;
    }

    public void setPastMatches(List<ValorantMatchDto> matches) {
        this.pastMatches = matches;
    }
}