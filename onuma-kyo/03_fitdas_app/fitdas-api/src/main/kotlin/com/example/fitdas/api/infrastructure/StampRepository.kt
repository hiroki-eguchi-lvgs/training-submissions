package com.example.fitdas.api.infrastructure

import com.example.fitdas.api.domain.entity.Stamp
import org.springframework.data.jpa.repository.JpaRepository

interface StampRepository : JpaRepository<Stamp, Long> {
}