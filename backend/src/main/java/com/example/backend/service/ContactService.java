package com.example.backend.service;

import com.example.backend.dto.ContactDTO;
import com.example.backend.model.Contact;
import com.example.backend.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;
    
    public Contact saveContact(ContactDTO contactDTO) {
        Contact contact = Contact.builder()
                .name(contactDTO.getName())
                .email(contactDTO.getEmail())
                .phone(contactDTO.getPhone())
                .message(contactDTO.getMessage())
                .status(true) // unread
                .trash(false)
                .build();
        
        return contactRepository.save(contact);
    }
    
    public List<Contact> getAllContacts() {
        return contactRepository.findByTrashOrderByCreatedAtDesc(false);
    }
    
    public List<Contact> getUnreadContacts() {
        return contactRepository.findByStatusAndTrashOrderByCreatedAtDesc(true, true);
    }
    
    public Optional<Contact> getContactById(Long id) {
        return contactRepository.findById(id);
    }
    
    public Contact markAsRead(Long id) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setStatus(true);
            return contactRepository.save(contact);
        }
        return null;
    }
    
    public Contact moveToTrash(Long id) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setTrash(true);
            return contactRepository.save(contact);
        }
        return null;
    }
    
    public Contact restoreFromTrash(Long id) {
        Optional<Contact> contactOpt = contactRepository.findById(id);
        if (contactOpt.isPresent()) {
            Contact contact = contactOpt.get();
            contact.setTrash(false);
            return contactRepository.save(contact);
        }
        return null;
    }
    
    public void deleteContact(Long id) {
        contactRepository.deleteById(id);
    }
}