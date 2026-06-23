package com.example.fitdas.api.domain.entity

import com.example.fitdas.api.domain.event.UserStampMigratedEvent


data class GroupWrapper(
    val group: Group,
    val event: UserStampMigratedEvent
) {
}