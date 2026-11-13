package com.gestion.bibliotheque.dto;

public record EmpruntRequest(Integer livreId, Long membreId, Integer dureeJours)
{
}