package com.example.fitdas.api.service

import com.example.fitdas.api.codegen.types.Card
import com.example.fitdas.api.logic.CardLogic
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

interface CardService {
    fun findMaxGenerationCardsByMemberships(membershipIds: Set<Long>): Map<Long, Card>
}

@Service
@Transactional
class CardServiceImpl(private val logic: CardLogic) : CardService {
    override fun findMaxGenerationCardsByMemberships(membershipIds: Set<Long>): Map<Long, Card> {
        return logic.findMaxGenerationCardsByMemberships(membershipIds).associateBy(
            keySelector = { it.membership.id!! },
            valueTransform = {
                Card(
                    id = it.id.toString(),
                    generation = it.generation,
                    currentStamps = null,
                    stampHistories = emptyList()
                )
            }
        )
    }
}