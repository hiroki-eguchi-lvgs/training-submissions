package com.example.fitdas.api.infrastructure

import com.example.fitdas.api.domain.StampHistory
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface StampHistoryRepository : JpaRepository<StampHistory, Long> {
    fun countByCardId(cardId: Long): Int

    @EntityGraph(attributePaths = ["stamp"])
    @Query(
        """
        SELECT s FROM StampHistory s
        WHERE s.card.id IN :cardIds
    """
    )
    fun findAllWithStampsByCardIds(cardIds: Set<Long>): List<StampHistory>
}