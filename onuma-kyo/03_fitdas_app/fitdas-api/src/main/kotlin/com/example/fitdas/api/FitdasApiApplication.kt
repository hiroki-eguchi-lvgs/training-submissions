package com.example.fitdas.api

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@SpringBootApplication
@EnableJpaAuditing
class FitdasApiApplication

fun main(args: Array<String>) {
    runApplication<FitdasApiApplication>(*args)
}