package com.example.fitdas.api.domain

import com.example.fitdas.api.domain.event.UserStampMigratedEvent


data class GroupWrapper(
    val group: Group,
    val event: UserStampMigratedEvent
) {
}