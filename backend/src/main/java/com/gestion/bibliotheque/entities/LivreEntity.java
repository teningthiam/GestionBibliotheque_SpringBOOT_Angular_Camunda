package com.gestion.bibliotheque.entities;

import jakarta.persistence.*;

import java.util.Date;

@Table(name = "livre")
@Entity
public class LivreEntity {

	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Id
	@Column(name = "numero")
	private Integer numero;

	private String titre;

	private String auteur;

	private String categorie;
	private Date dateAjout;
	private boolean disponible = true;

	public LivreEntity(Integer numero, String titre, String auteur, String categorie, Date dateAjout) {
		super();
		this.numero = numero;
		this.titre = titre;
		this.auteur = auteur;
		this.categorie = categorie;
		this.dateAjout = dateAjout;
	}

	public LivreEntity() {
		super();
	}

	public Integer getNumero() {
		return numero;
	}

	public void setNumero(Integer numero) {
		this.numero = numero;
	}

	public String getTitre() {
		return titre;
	}

	public void setTitre(String titre) {
		this.titre = titre;
	}

	public String getAuteur() {
		return auteur;
	}

	public void setAuteur(String auteur) {
		this.auteur = auteur;
	}

	public String getCategorie() {
		return categorie;
	}

	public void setCategorie(String categorie) {
		this.categorie = categorie;
	}

	public Date getDateAjout() {
		return dateAjout;
	}

	public void setDateAjout(Date dateAjout) {
		this.dateAjout = dateAjout;
	}

	public boolean isDisponible() {
		return disponible;
	}

	public void setDisponible(boolean disponible) {
		this.disponible = disponible;
	}

	@Override
	public String toString() {
		return "Livre [numero=" + numero + ", titre=" + titre + ", auteur=" + auteur
				+ ", categorie=" + categorie + " ]";
	}
}