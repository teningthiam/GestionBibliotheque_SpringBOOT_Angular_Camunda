package com.gestion.bibliotheque.repositories;

import com.gestion.bibliotheque.entities.LivreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LivreRepository extends JpaRepository<LivreEntity, Integer> {
    List<LivreEntity> findByTitreContainingIgnoreCase(String titre);


}
