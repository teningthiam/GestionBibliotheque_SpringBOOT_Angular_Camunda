package com.gestion.bibliotheque.services;

import java.time.LocalDate;
import java.util.Map;

import com.gestion.bibliotheque.dto.EmpruntRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.gestion.bibliotheque.entities.EmpruntEntity;
import com.gestion.bibliotheque.entities.LivreEntity;
import com.gestion.bibliotheque.entities.MembreEntity;
import com.gestion.bibliotheque.repositories.EmpruntRepository;
import com.gestion.bibliotheque.repositories.LivreRepository;
import com.gestion.bibliotheque.repositories.MembreRepository;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.response.ProcessInstanceEvent;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmpruntService {

    private final EmpruntRepository empruntRepo;
    private final LivreRepository livreRepo;
    private final MembreRepository membreRepo;
    private final CamundaClient camundaClient;

    @Transactional
    public EmpruntEntity creerEmprunt(EmpruntRequest req) {
        LivreEntity livre = livreRepo.findById(req.livreId())
                .orElseThrow(() -> new IllegalArgumentException("Livre introuvable"));
        MembreEntity membre = membreRepo.findById(req.membreId())
                .orElseThrow(() -> new IllegalArgumentException("Membre introuvable"));
        if (!livre.isDisponible()) {
            throw new IllegalStateException("Livre déjà emprunté");
        }

        int duree = req.dureeJours() != null ? req.dureeJours() : 14;

        EmpruntEntity e = new EmpruntEntity();
        e.setLivre(livre);
        e.setMembre(membre);
        e.setDateEmprunt(LocalDate.now());
        e.setDateRetourPrevue(LocalDate.now().plusDays(duree));
        e.setStatut("EN_COURS");

        livre.setDisponible(false);
        livreRepo.save(livre);
        e = empruntRepo.save(e);

        // Démarrage automatique du processus Camunda
        Map<String, Object> vars = Map.of(
                "empruntId", e.getId(),
                "emailClient", membre.getEmail(),
                "nomMembre", membre.getPrenom() + " " + membre.getNom(),
                "titreLivre", livre.getTitre(),
                "dateRetourPrevue", e.getDateRetourPrevue().toString());

        ProcessInstanceEvent instance = camundaClient.newCreateInstanceCommand()
                .bpmnProcessId("Process_Emprunt")
                .latestVersion()
                .variables(vars)
                .send().join();

        e.setProcessInstanceKey(instance.getProcessInstanceKey());
        return empruntRepo.save(e);
    }

    @Transactional
    public EmpruntEntity enregistrerRetour(long userTaskKey, long processInstanceKey) {
        EmpruntEntity e = empruntRepo.findByProcessInstanceKey(processInstanceKey)
                .orElseThrow(() -> new IllegalArgumentException("Emprunt introuvable"));

        // Termine la tâche "Retour" dans Camunda
        camundaClient.newCompleteUserTaskCommand(userTaskKey).send().join();

        e.setStatut("RETOURNE");
        e.setDateRetour(LocalDate.now());
        e.getLivre().setDisponible(true);
        livreRepo.save(e.getLivre());
        return empruntRepo.save(e);
    }
}