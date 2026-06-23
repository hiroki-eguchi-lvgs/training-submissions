package com.example.fitdas.api.domain.logic

import com.example.fitdas.api.domain.entity.MigratingStatus
import com.example.fitdas.api.domain.entity.User
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.exception.BusinessException
import com.example.fitdas.api.infrastructure.UserRepository
import org.springframework.stereotype.Component
import kotlin.jvm.optionals.getOrNull


@Component
class UserLogic(
    private val repository: UserRepository,
) {
    fun findById(id: Long) = repository.findById(id).getOrNull()

    fun updateUser(id: Long, migratingStamps: Int): User {
        val user: User = repository.findById(id).orElseThrow({ throw BusinessException("ユーザーが見つかりません") })
        user.migratingStamps = migratingStamps
        user.migratingStatus = MigratingStatus.MIGRATING
        return repository.save(user)
    }

    fun updateUserOnStampMigrated(event: UserStampMigratedEvent): User {
        val user: User =
            repository.findById(event.userId).orElseThrow({ throw BusinessException("ユーザーが見つかりません") })
        user.migratingStatus = event.status
        return repository.save(user)
    }

    fun findAllByIds(ids: Set<Long>): List<User> = repository.findAllById(ids)
}