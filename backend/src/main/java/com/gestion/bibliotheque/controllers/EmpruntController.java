package com.gestion.bibliotheque.controllers;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.gestion.bibliotheque.dto.EmpruntRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gestion.bibliotheque.entities.EmpruntEntity;
import com.gestion.bibliotheque.repositories.EmpruntRepository;
import com.gestion.bibliotheque.services.EmpruntService;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.enums.UserTaskState;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/emprunts")
@RequiredArgsConstructor
public class EmpruntController {

    private final EmpruntService service;
    private final EmpruntRepository repo;
    private final CamundaClient camundaClient;

    @PostMapping
    public EmpruntEntity creer(@RequestBody EmpruntRequest req) {
        return service.creerEmprunt(req);
    }

    @GetMapping("/list")
    public List<EmpruntEntity> lister() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpruntEntity> parId(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Emprunts à traiter : tâches "Retour" en attente dans Camunda
    @GetMapping("/a-traiter")
    public List<Map<String, Object>> aTraiter() {
        var taches = camundaClient.newUserTaskSearchRequest()
                .filter(f -> f.state(UserTaskState.CREATED).elementId("Task_Retour"))
                .send().join().items();

        return taches.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("userTaskKey", t.getUserTaskKey());
            m.put("tache", t.getName());
            m.put("processInstanceKey", t.getProcessInstanceKey());
            m.put("creeLe", t.getCreationDate());
            repo.findByProcessInstanceKey(t.getProcessInstanceKey())
                    .ifPresent(e -> m.put("emprunt", e));
            return m;
        }).toList();
    }

    // Enregistrer le retour du livre (termine la tâche "Retour")
    @PostMapping("/retour/{userTaskKey}/{processInstanceKey}")
    public EmpruntEntity retour(@PathVariable long userTaskKey,
                                @PathVariable long processInstanceKey) {
        return service.enregistrerRetour(userTaskKey, processInstanceKey);
    }
}