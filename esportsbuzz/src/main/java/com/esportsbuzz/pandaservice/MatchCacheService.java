package com.esportsbuzz.pandaservice;

import com.esportsbuzz.dto.UpcomingMatchDto;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Component
public class MatchCacheService {

    private volatile List<UpcomingMatchDto> upcomingMatches = Collections.emptyList();
    private volatile Instant lastUpdated = null;

    public List<UpcomingMatchDto> getUpcomingMatches() {
        return upcomingMatches;
    }

    public void setUpcomingMatches(List<UpcomingMatchDto> matches) {
        this.upcomingMatches = matches;
        this.lastUpdated = Instant.now();
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }
}