package com.esportsbuzz.controller;

import com.esportsbuzz.dto.ValorantMatchDto;
import com.esportsbuzz.pandaservice.PandaScoreValorantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Generic controller for game-specific matches (e.g. /matches/pubg/upcoming).
 * Note: /matches/valorant/* is handled by ValorantMatchController due to Spring's exact path matching preference.
 */
@RestController
@RequestMapping("/matches")
public class GameMatchController {

    @Autowired
    private PandaScoreValorantService pandaScoreService;

    @GetMapping("/{game}/upcoming")
    public ResponseEntity<List<ValorantMatchDto>> getUpcomingMatches(@PathVariable String game) {
        return ResponseEntity.ok(pandaScoreService.getMatchesByGame(game, "upcoming"));
    }

    @GetMapping("/{game}/live")
    public ResponseEntity<List<ValorantMatchDto>> getLiveMatches(@PathVariable String game) {
        return ResponseEntity.ok(pandaScoreService.getMatchesByGame(game, "running"));
    }

    @GetMapping("/{game}/past")
    public ResponseEntity<List<ValorantMatchDto>> getPastMatches(@PathVariable String game) {
        return ResponseEntity.ok(pandaScoreService.getMatchesByGame(game, "past"));
    }
}
