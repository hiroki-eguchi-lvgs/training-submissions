package com.example.fitdas.api.domain

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant

@Entity
@Table(name = "cards")
@EntityListeners(
    AuditingEntityListener::class
)
class Card(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id", nullable = false)
    val membership: Membership,
    val generation: Int = 1
) {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    var id: Long? = null

    @CreatedDate
    @Column(nullable = false, updatable = false)
    var createdAt: Instant? = null

    @LastModifiedDate
    @Column(nullable = false)
    var updatedAt: Instant? = null

    @Version
    var version: Int? = null

    @OneToMany(mappedBy = "card", cascade = [CascadeType.ALL], orphanRemoval = true)
    val stampHistories: MutableList<StampHistory> = ArrayList()

    fun addStampHistory(stampHistory: StampHistory) {
        stampHistories.add(stampHistory)
    }

    fun countStampHistories(): Int = stampHistories.size

    fun createNewCard(): Card {
        val newCard = Card(this.membership, generation + 1)
        membership.addCard(newCard)
        return newCard
    }

    companion object {
        fun createNewCardWithMigration(
            membership: Membership,
            migratingStamps: Int,
            assignedStamps: List<Stamp>
        ): Card {
            val card = Card(membership)
            repeat(migratingStamps) {
                card.addStampHistory(StampHistory(card, assignedStamps.random()))
            }
            return card
        }
    }
}