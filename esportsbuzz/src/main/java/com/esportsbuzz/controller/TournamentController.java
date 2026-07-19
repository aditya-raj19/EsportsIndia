package com.esportsbuzz.controller;

import com.esportsbuzz.dto.TournamentDto;
import com.esportsbuzz.pandaservice.TournamentCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tournaments")
public class TournamentController {

    @Autowired
    private TournamentCacheService tournamentCacheService;

    @GetMapping("/{game}/running")
    public ResponseEntity<List<TournamentDto>> getRunningTournaments(@PathVariable String game) {
        List<TournamentDto> tournaments = tournamentCacheService.getTournaments(game, "running");
        return ResponseEntity.ok(tournaments);
    }

    @GetMapping("/{game}/upcoming")
    public ResponseEntity<List<TournamentDto>> getUpcomingTournaments(@PathVariable String game) {
        List<TournamentDto> tournaments = tournamentCacheService.getTournaments(game, "upcoming");
        return ResponseEntity.ok(tournaments);
    }
}
