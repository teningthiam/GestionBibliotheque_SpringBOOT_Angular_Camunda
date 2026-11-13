package com.gestion.bibliotheque.services;

import com.gestion.bibliotheque.entities.LivreEntity;
import org.springframework.stereotype.Service;

import java.util.List;


public interface LivreService {

    List<LivreEntity> obtenirListLivres();
}
