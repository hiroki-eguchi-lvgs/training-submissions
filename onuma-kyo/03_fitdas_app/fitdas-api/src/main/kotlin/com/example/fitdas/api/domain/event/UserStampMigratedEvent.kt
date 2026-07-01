package com.example.fitdas.api.domain.event

import com.example.fitdas.api.domain.entity.MigratingStatus

data class UserStampMigratedEvent(
    val userId: Long,
    val status: MigratingStatus,
    val migratingStamps: Int
) {
    fun toMigrated() = UserStampMigratedEvent(
        userId = userId,
        status = MigratingStatus.MIGRATED,
        migratingStamps = migratingStamps
    )
}