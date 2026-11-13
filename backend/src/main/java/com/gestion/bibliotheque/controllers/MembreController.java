package com.gestion.bibliotheque.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gestion.bibliotheque.entities.MembreEntity;
import com.gestion.bibliotheque.repositories.MembreRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/membres")
@RequiredArgsConstructor
public class MembreController {

    private final MembreRepository repo;

    @PostMapping
    public MembreEntity creer(@RequestBody MembreEntity m) {
        m.setId(null);
        return repo.save(m);
    }

    @GetMapping("/list")
    public List<MembreEntity> lister() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembreEntity> parId(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembreEntity> modifier(@PathVariable Long id, @RequestBody MembreEntity m) {
        return repo.findById(id).map(ex -> {
            ex.setNom(m.getNom());
            ex.setPrenom(m.getPrenom());
            ex.setEmail(m.getEmail());
            ex.setTelephone(m.getTelephone());
            return ResponseEntity.ok(repo.save(ex));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}