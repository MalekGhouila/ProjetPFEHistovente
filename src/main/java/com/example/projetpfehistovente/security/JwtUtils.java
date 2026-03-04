package com.example.projetpfehistovente.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    public String generateToken(String username, String role){
        SecretKey Key= Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .subject(username)
                .claim("role",role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+jwtExpiration))
                .signWith(Key)
                .compact();
    }

    public String getUsernameFromToken(String token){
        return parseClaims(token).getSubject();
    }

    public boolean validateToken(String token){
        try{
            parseClaims(token);
            return true;
        }
        catch(JwtException | IllegalArgumentException e){
            return false;
        }
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    private Claims parseClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
