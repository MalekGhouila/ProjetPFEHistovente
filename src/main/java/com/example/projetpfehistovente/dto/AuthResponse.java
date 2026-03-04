package com.example.projetpfehistovente.dto;

import com.example.projetpfehistovente.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private Role role;
}
