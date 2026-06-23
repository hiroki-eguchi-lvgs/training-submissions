package com.example.fitdas.api.domain.entity

import com.example.fitdas.api.domain.event.UserStampMigratedEvent


data class MembershipWrapper(
    val membership: Membership,
    val event: UserStampMigratedEvent
) {
}