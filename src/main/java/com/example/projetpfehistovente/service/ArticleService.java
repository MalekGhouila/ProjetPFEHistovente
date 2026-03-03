package com.example.projetpfehistovente.service;

import com.example.projetpfehistovente.entity.Article;
import com.example.projetpfehistovente.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    public List<Article> findAll(){
        return articleRepository.findAll();
    }

    public Optional<Article> findById(Long id){
        return articleRepository.findById(id);
    }

    public Article save(Article article){
        return articleRepository.save(article);
    }

    public void deleteById(Long id){
        articleRepository.deleteById(id);
    }

}
