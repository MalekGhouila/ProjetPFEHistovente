package com.example.projetpfehistovente.dto;

import com.example.projetpfehistovente.entity.Role;

public class UpdateUserRequest {
    private String username;
    private String email;
    private String password; // optional - null means keep existing
    private Role role;
    private Long idMagasin;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getIdMagasin() { return idMagasin; }
    public void setIdMagasin(Long idMagasin) { this.idMagasin = idMagasin; }
}