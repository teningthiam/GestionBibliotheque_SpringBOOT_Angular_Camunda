package com.gestion.bibliotheque.workers;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.annotation.Variable;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationEmpruntWorker {

    private final JavaMailSender mailSender;

    @JobWorker(type = "notifier-emprunt")
    public void notifier(@Variable String emailClient,
                         @Variable String nomMembre,
                         @Variable String titreLivre,
                         @Variable String dateRetourPrevue) {

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(emailClient);
        mail.setSubject("Confirmation de votre emprunt");
        mail.setText("Bonjour " + nomMembre + ",\n\n"
                + "Votre emprunt du livre « " + titreLivre + " » a bien été enregistré.\n"
                + "Date de retour prévue : " + dateRetourPrevue + ".\n\nLa Bibliothèque");
        mailSender.send(mail);
    }
}