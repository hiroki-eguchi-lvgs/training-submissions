package com.example.fitdas.api.service

import com.example.fitdas.api.domain.User
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.exception.BusinessException
import com.example.fitdas.api.logic.UserLogic
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

interface UserService {
    fun user(id: Long): User?
    fun findAllByIds(ids: Set<Long>): Map<Long, com.example.fitdas.api.codegen.types.User>
    fun updateUser(id: Long, migratingStamps: Int): User
    fun completeStampMigration(event: UserStampMigratedEvent): Unit
}

@Service
@Transactional
class UserServiceImpl(private val logic: UserLogic) : UserService {
    override fun user(id: Long): User {
        return logic.findById(id) ?: throw BusinessException("ユーザーが見つかりません")
    }

    override fun findAllByIds(ids: Set<Long>): Map<Long, com.example.fitdas.api.codegen.types.User> {
        return logic.findAllByIds(ids).associateBy(
            keySelector = { it.id!! },
            valueTransform = { it.toGraphQLUser() }
        )
    }

    override fun updateUser(id: Long, migratingStamps: Int): User {
        return logic.updateUser(id, migratingStamps)
    }

    override fun completeStampMigration(event: UserStampMigratedEvent): Unit {
        logic.updateUserOnStampMigrated(event)
    }
}