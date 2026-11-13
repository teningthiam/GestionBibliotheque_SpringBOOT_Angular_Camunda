package com.gestion.bibliotheque.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestion.bibliotheque.entities.EmpruntEntity;

public interface EmpruntRepository extends JpaRepository<EmpruntEntity, Long> {
    Optional<EmpruntEntity> findByProcessInstanceKey(Long processInstanceKey);
}