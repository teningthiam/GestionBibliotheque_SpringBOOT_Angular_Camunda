package com.gestion.bibliotheque.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gestion.bibliotheque.entities.MembreEntity;

public interface MembreRepository extends JpaRepository<MembreEntity, Long> {
}