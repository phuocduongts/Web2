package com.example.backend.controller;

import com.example.backend.dto.ContactDTO;
import com.example.backend.model.Contact;
import com.example.backend.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactService contactService;

    // Submit a new contact form
    @PostMapping
    public ResponseEntity<?> submitContact(@Valid @RequestBody ContactDTO contactDTO, BindingResult result) {
        // Validate form data
        if (result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
        }

        // Create and save new contact using service
        Contact savedContact = contactService.saveContact(contactDTO);
        return new ResponseEntity<>(savedContact, HttpStatus.CREATED);
    }

    // Admin endpoints - For admin dashboard
    
    // Get all contacts (not in trash)
    @GetMapping
    public ResponseEntity<List<Contact>> getAllContacts() {
        List<Contact> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(contacts);
    }
    
    // Get unread contacts
    @GetMapping("/unread")
    public ResponseEntity<List<Contact>> getUnreadContacts() {
        List<Contact> contacts = contactService.getUnreadContacts();
        return ResponseEntity.ok(contacts);
    }
    
    // Get a single contact by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getContact(@PathVariable Long id) {
        Optional<Contact> contact = contactService.getContactById(id);
        if (contact.isPresent()) {
            return ResponseEntity.ok(contact.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    // Mark a contact as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Contact updatedContact = contactService.markAsRead(id);
        if (updatedContact != null) {
            return ResponseEntity.ok(updatedContact);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Move to trash
    @PutMapping("/{id}/trash")
    public ResponseEntity<?> moveToTrash(@PathVariable Long id) {
        Contact updatedContact = contactService.moveToTrash(id);
        if (updatedContact != null) {
            return ResponseEntity.ok(updatedContact);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Restore from trash
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreFromTrash(@PathVariable Long id) {
        Contact updatedContact = contactService.restoreFromTrash(id);
        if (updatedContact != null) {
            return ResponseEntity.ok(updatedContact);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Delete permanently
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContact(@PathVariable Long id) {
        Optional<Contact> contactOpt = contactService.getContactById(id);
        if (contactOpt.isPresent()) {
            contactService.deleteContact(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}