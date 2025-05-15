package com.example.backend.repository;

import com.example.backend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    // Find all non-trashed contacts
    List<Contact> findByTrashOrderByCreatedAtDesc(boolean trash);
    
    // Find unread contacts
    List<Contact> findByStatusAndTrashOrderByCreatedAtDesc(boolean status, boolean trash);
}