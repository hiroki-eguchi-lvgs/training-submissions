package com.example.fitdas.api.infrastructure

import com.example.fitdas.api.domain.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.math.BigInteger

interface UserRepository : JpaRepository<User, Long> {
    fun findByGoogleSubId(googleSubId: BigInteger): User?
}
