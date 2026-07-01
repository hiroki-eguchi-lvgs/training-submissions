package com.example.fitdas.api.service

import com.example.fitdas.api.codegen.types.Card
import com.example.fitdas.api.infrastructure.CardRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

interface CardQueryService {
    fun findMaxGenerationCardsByMemberships(membershipIds: Set<Long>): Map<Long, Card>
}

/*
* NOTE: READの責務のみを持つService、Logicを挟むと冗長になるため直接Repositoryに依存する
*/
@Service
@Transactional(readOnly = true)
class CardQueryServiceImpl(private val repository: CardRepository) : CardQueryService {
    override fun findMaxGenerationCardsByMemberships(membershipIds: Set<Long>): Map<Long, Card> {
        return repository.findMaxGenerationCardsByMemberships(membershipIds).associateBy(
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