package com.example.projetpfehistovente.dto;

import com.example.projetpfehistovente.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private Role role;
}
