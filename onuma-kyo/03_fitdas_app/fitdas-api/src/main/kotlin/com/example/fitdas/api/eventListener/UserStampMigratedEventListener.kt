package com.example.fitdas.api.eventListener

import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.service.UserService
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class UserStampMigratedEventListener(
    private val userService: UserService,
) {
    @EventListener
    fun onUserStampMigrated(event: UserStampMigratedEvent) {
        userService.completeStampMigration(event)
    }
}