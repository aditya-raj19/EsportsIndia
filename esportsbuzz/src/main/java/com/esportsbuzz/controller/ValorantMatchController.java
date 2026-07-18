package com.esportsbuzz.controller;

import com.esportsbuzz.dto.UpcomingMatchDto;
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
    public ResponseEntity<List<UpcomingMatchDto>> upcoming() {
        return ResponseEntity.ok(matchCacheService.getUpcomingMatches());
    }
}