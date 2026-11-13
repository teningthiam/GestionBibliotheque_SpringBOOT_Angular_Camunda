package com.gestion.bibliotheque.services;

import com.gestion.bibliotheque.entities.LivreEntity;
import com.gestion.bibliotheque.repositories.LivreRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LivreServiceImpl  implements LivreService{

    private LivreRepository livreRepository;

    @Override
    public List<LivreEntity> obtenirListLivres() {
        return List.of();
    }
}
