package com.example.fitdas.api.infrastructure

import com.example.fitdas.api.domain.entity.Card
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface CardRepository : JpaRepository<Card, Long> {

    @Query(
        """
        SELECT c FROM Card c
        WHERE c.membership.id IN :membershipIds
        AND c.generation = (
            SELECT MAX(c2.generation) FROM Card c2 WHERE c2.membership.id = c.membership.id
        )
    """
    )
    fun findMaxGenerationCardsByMemberships(membershipIds: Set<Long>): Set<Card>
}