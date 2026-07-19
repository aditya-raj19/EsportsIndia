package com.esportsbuzz.controller;

import com.esportsbuzz.dto.ValorantMatchDto;
import com.esportsbuzz.pandaservice.MatchCacheService;
import com.esportsbuzz.pandaservice.PandaScoreValorantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/matches/valorant")
public class ValorantMatchController {

    @Autowired
    private MatchCacheService matchCacheService;

    @GetMapping("/upcoming")
    public ResponseEntity<List<ValorantMatchDto>> upcoming() {
        return ResponseEntity.ok(matchCacheService.getUpcomingMatches());
    }
    
    @GetMapping("/live")
    public ResponseEntity<List<ValorantMatchDto>> live() {
        return ResponseEntity.ok(matchCacheService.getLiveMatches());
    }

    @GetMapping("/past")
    public ResponseEntity<List<ValorantMatchDto>> past() {
        return ResponseEntity.ok(matchCacheService.getPastMatches());
    }

    /**
     * Returns ALL currently live matches across every game (Valorant, CS2, LoL, Dota2, etc.)
     * Powered by PandaScore's /lives endpoint.
     */
    @GetMapping("/all/live")
    public ResponseEntity<List<ValorantMatchDto>> allLive() {
        return ResponseEntity.ok(matchCacheService.getAllLiveMatches());
    }
}