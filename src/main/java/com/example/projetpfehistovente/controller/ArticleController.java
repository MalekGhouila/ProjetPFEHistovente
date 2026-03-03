package com.example.projetpfehistovente.controller;

import com.example.projetpfehistovente.entity.Article;
import com.example.projetpfehistovente.entity.Magasin;
import com.example.projetpfehistovente.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "http://localhost:4200")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @GetMapping
    public List<Article> getAll(){
        return articleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getById(@PathVariable Long id){
        return articleService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Article create(@RequestBody Article article){
        return articleService.save(article);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> update(@PathVariable Long id, @RequestBody Article article){
        return articleService.findById(id)
                .map(existing -> {
                    article.setIdArticle(id);
                    return ResponseEntity.ok(articleService.save(article));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        return articleService.findById(id)
                .map(existing -> {
                    articleService.deleteById(id);
                    return ResponseEntity.<Void>ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.<Void>notFound().build());
    }
}