package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.dto.UpdateUserRequest;
import com.example.projetpfehistovente.entity.User;
import com.example.projetpfehistovente.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAll() {
        return userService.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        return userService.findById(id)
                .map(existing -> {
                    // Block self-deletion
                    if (existing.getUsername().equals(principal.getName())) {
                        return ResponseEntity.<Void>status(403).<Void>build();
                    }
                    userService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }

    @PutMapping("/{id}/store")
    public ResponseEntity<User> updateStore(
            @PathVariable Long id,
            @RequestBody Long storeId) {
        return userService.findById(id)
                .map(user -> {
                    user.setIdMagasin(storeId);
                    return ResponseEntity.ok(userService.save(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<User> toggleActive(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> {
                    user.setActive(!user.getActive());
                    return ResponseEntity.ok(userService.save(user));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest req) {
        try {
            User updated = userService.updateUser(id, req);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}