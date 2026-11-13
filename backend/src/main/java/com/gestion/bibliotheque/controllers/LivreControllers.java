package com.gestion.bibliotheque.controllers;

import java.util.Date;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gestion.bibliotheque.entities.LivreEntity;
import com.gestion.bibliotheque.repositories.LivreRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/livres")
@RequiredArgsConstructor
public class LivreControllers {

    private final LivreRepository repo;

    @PostMapping
    public LivreEntity creer(@RequestBody LivreEntity l) {
        l.setNumero(null);
        l.setDateAjout(new Date());
        l.setDisponible(true);
        return repo.save(l);
    }

    @GetMapping("/list")
    public List<LivreEntity> lister(@RequestParam(required = false) String titre) {
        return titre == null ? repo.findAll() : repo.findByTitreContainingIgnoreCase(titre);
    }

    @GetMapping("/{numero}")
    public ResponseEntity<LivreEntity> parNumero(@PathVariable Integer numero) {
        return repo.findById(numero).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{numero}")
    public ResponseEntity<LivreEntity> modifier(@PathVariable Integer numero, @RequestBody LivreEntity l) {
        return repo.findById(numero).map(ex -> {
            ex.setTitre(l.getTitre());
            ex.setAuteur(l.getAuteur());
            ex.setCategorie(l.getCategorie());
            return ResponseEntity.ok(repo.save(ex));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{numero}")
    public ResponseEntity<Void> supprimer(@PathVariable Integer numero) {
        if (!repo.existsById(numero)) return ResponseEntity.notFound().build();
        repo.deleteById(numero);
        return ResponseEntity.noContent().build();
    }
}