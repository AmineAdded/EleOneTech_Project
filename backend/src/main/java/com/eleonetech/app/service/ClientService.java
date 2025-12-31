package com.eleonetech.app.service;

import com.eleonetech.app.dto.ClientResponse;
import com.eleonetech.app.dto.ClientSimpleResponse;
import com.eleonetech.app.dto.CreateClientRequest;
import com.eleonetech.app.dto.UpdateClientRequest;
import com.eleonetech.app.entity.Client;
import com.eleonetech.app.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {

    private final ClientRepository clientRepository;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public ClientResponse createClient(CreateClientRequest request) {
        // Vérifier si la référence existe déjà
        if (clientRepository.existsByRef(request.getRef())) {
            throw new RuntimeException("Un client avec cette référence existe déjà");
        }

        // Vérifier si le nom existe déjà
        if (clientRepository.existsByNomComplet(request.getNomComplet())) {
            throw new RuntimeException("Un client avec ce nom existe déjà");
        }

        Client client = Client.builder()
                .ref(request.getRef())
                .nomComplet(request.getNomComplet())
                .adresseLivraison(request.getAdresseLivraison())
                .adresseFacturation(request.getAdresseFacturation())
                .devise(request.getDevise())
                .modeTransport(request.getModeTransport())
                .incoTerme(request.getIncoTerme())
                .isActive(true)
                .build();

        client = clientRepository.save(client);
        log.info("Client créé: {} (Ref: {})", client.getNomComplet(), client.getRef());

        return mapToResponse(client);
    }

    public List<ClientResponse> getAllClients() {
        return clientRepository.findAllActiveOrderByRef()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ClientSimpleResponse> getAllClientsSimple() {
        return clientRepository.findAllActiveOrderByRef()
                .stream()
                .map(client -> ClientSimpleResponse.builder()
                        .id(client.getId())
                        .nomComplet(client.getNomComplet())
                        .build())
                .collect(Collectors.toList());
    }

    public ClientResponse getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        return mapToResponse(client);
    }

    @Transactional
    public ClientResponse updateClient(Long id, UpdateClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        // Vérifier si la nouvelle référence existe déjà (sauf si c'est le même client)
        if (request.getRef() != null && !client.getRef().equals(request.getRef()) &&
                clientRepository.existsByRef(request.getRef())) {
            throw new RuntimeException("Un client avec cette référence existe déjà");
        }

        // Vérifier si le nouveau nom existe déjà (sauf si c'est le même client)
        if (request.getNomComplet() != null && !client.getNomComplet().equals(request.getNomComplet()) &&
                clientRepository.existsByNomComplet(request.getNomComplet())) {
            throw new RuntimeException("Un client avec ce nom existe déjà");
        }

        // Mettre à jour uniquement si les valeurs ne sont pas nulles
        if (request.getRef() != null) {
            client.setRef(request.getRef());
        }
        if (request.getNomComplet() != null) {
            client.setNomComplet(request.getNomComplet());
        }
        if (request.getAdresseLivraison() != null) {
            client.setAdresseLivraison(request.getAdresseLivraison());
        }
        if (request.getAdresseFacturation() != null) {
            client.setAdresseFacturation(request.getAdresseFacturation());
        }
        if (request.getDevise() != null) {
            client.setDevise(request.getDevise());
        }
        if (request.getModeTransport() != null) {
            client.setModeTransport(request.getModeTransport());
        }
        if (request.getIncoTerme() != null) {
            client.setIncoTerme(request.getIncoTerme());
        }

        client = clientRepository.save(client);
        log.info("Client mis à jour: {} (Ref: {})", client.getNomComplet(), client.getRef());

        return mapToResponse(client);
    }

    @Transactional
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        clientRepository.deleteById(id);
        log.info("Client supprimé: {} (Ref: {})", client.getNomComplet(), client.getRef());
    }

    private ClientResponse mapToResponse(Client client) {
        return ClientResponse.builder()
                .id(client.getId())
                .ref(client.getRef())
                .nomComplet(client.getNomComplet())
                .adresseLivraison(client.getAdresseLivraison())
                .adresseFacturation(client.getAdresseFacturation())
                .devise(client.getDevise())
                .modeTransport(client.getModeTransport())
                .incoTerme(client.getIncoTerme())
                .isActive(client.getIsActive())
                .createdAt(client.getCreatedAt().format(formatter))
                .updatedAt(client.getUpdatedAt().format(formatter))
                .build();
    }
}