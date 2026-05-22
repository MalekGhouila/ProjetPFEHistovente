package com.example.projetpfehistovente.repository;

import com.example.projetpfehistovente.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    // Duplicate check excluding the user being updated
    Boolean existsByUsernameAndIdNot(String username, Long id);
    Boolean existsByEmailAndIdNot(String email, Long id);
}