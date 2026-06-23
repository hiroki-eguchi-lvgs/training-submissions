package com.example.fitdas.api.domain.logic

import com.example.fitdas.api.domain.entity.*
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.infrastructure.CardRepository
import org.springframework.stereotype.Component


@Component
class CardLogic(
    private val cardRepository: CardRepository,
) {
    fun createCard(
        membership: Membership,
        event: UserStampMigratedEvent,
        assignedStamps: List<Stamp>
    ): Card {
        val card =
            if (event.status === MigratingStatus.MIGRATING)
                Card.createNewCardWithMigration(
                    membership,
                    event.migratingStamps,
                    assignedStamps
                )
            else
                Card(membership)
        return cardRepository.save(card)
    }

    fun stamp(
        membership: Membership,
        assignedStamps: List<Stamp>,
        stampsToReward: Int
    ): Unit {
        // スタンプ数が規定の数に達していたら次のカードを発行
        val currentCard = membership.getCurrentCard()
        currentCard.addStampHistory(StampHistory(currentCard, assignedStamps.random()))
        if (currentCard.countStampHistories() == stampsToReward) {
            val newCard = currentCard.createNewCard()
            cardRepository.saveAll(mutableSetOf<Card>(currentCard, newCard))
            return
        }
        cardRepository.save(currentCard)
    }
}