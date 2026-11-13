package com.gestion.bibliotheque;

import io.camunda.client.annotation.Deployment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Deployment(resources = "classpath:emprunt.bpmn")
public class GestionBibliothequeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestionBibliothequeBackendApplication.class, args);
	}

}
