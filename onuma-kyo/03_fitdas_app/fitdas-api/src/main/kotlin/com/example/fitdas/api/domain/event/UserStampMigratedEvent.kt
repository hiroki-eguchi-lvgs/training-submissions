package com.example.fitdas.api.domain.event

import com.example.fitdas.api.domain.MigratingStatus

data class UserStampMigratedEvent(
    val userId: Long,
    val status: MigratingStatus,
    val migratingStamps: Int
) {
    fun toMigratied() = UserStampMigratedEvent(
        userId = userId,
        status = MigratingStatus.MIGRATED,
        migratingStamps = migratingStamps
    )
}