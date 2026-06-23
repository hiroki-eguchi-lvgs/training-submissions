package com.example.fitdas.api.logic

import com.example.fitdas.api.domain.*
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.infrastructure.CardRepository
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import java.time.LocalTime

class CardLogicTest {

    private lateinit var sut: CardLogic
    private lateinit var repository: CardRepository

    @BeforeEach
    fun setUp() {
        this.repository = mock()
        this.sut = CardLogic(repository)
    }

    // ========================================
    // 観点: カード新規作成 - createCard()
    // ========================================
    @Test
    @DisplayName("[正常系] ユーザーのステータスがMigratingStatus.MIGRATINGの場合、StampHistoryが紐づけ済のCardが返ること")
    fun shouldReturnCardWithStampHistoriesWhenMigrating() {
        // GIVEN
        val targetMigratingStamps = 29
        val eventWithStatusMigrating = UserStampMigratedEvent(
            userId = 1L,
            status = MigratingStatus.MIGRATING,
            migratingStamps = targetMigratingStamps,
        )
        val membership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        )
        val assignedStamps = listOf(
            Stamp(
                "http://example.com/stamp.png"
            )
        )
        whenever(this.repository.save(any()))
            .thenAnswer { it.getArgument<Card>(0) }

        // WHEN
        this.sut.createCard(membership, eventWithStatusMigrating, assignedStamps)

        // THEN
        argumentCaptor<Card>().apply {
            verify(repository).save(capture())
            Assertions.assertNotNull(firstValue)
            Assertions.assertEquals(targetMigratingStamps, firstValue.countStampHistories())
            Assertions.assertEquals(1, firstValue.generation)
            Assertions.assertEquals(membership, firstValue.membership)
        }
    }

    @Test
    @DisplayName("[正常系] ユーザーのステータスがMigratingStatus.MIGRATING以外の場合、StampHistoryが紐づけなしのCardが返ること")
    fun shouldReturnCardWithoutStampHistoriesWhenNotMigrating() {
        // GIVEN
        val targetMigratingStamps = 29
        val eventWithStatusMigrating = UserStampMigratedEvent(
            userId = 1L,
            status = MigratingStatus.MIGRATED,
            migratingStamps = targetMigratingStamps,
        )
        val membership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        )
        val assignedStamps = listOf(
            Stamp(
                "http://example.com/stamp.png"
            )
        )
        whenever(this.repository.save(any()))
            .thenAnswer { it.getArgument<Card>(0) }

        // WHEN
        this.sut.createCard(membership, eventWithStatusMigrating, assignedStamps)

        // THEN
        argumentCaptor<Card>().apply {
            verify(repository).save(capture())
            Assertions.assertNotNull(firstValue)
            Assertions.assertEquals(0, firstValue.countStampHistories())
            Assertions.assertEquals(1, firstValue.generation)
            Assertions.assertEquals(membership, firstValue.membership)
        }
    }

    // ========================================
    // 観点: カードにスタンプする - stamp
    // ========================================
    @Test
    @DisplayName("[正常系] スタンプが規定の数に達する場合に、新規カードを作成し既存カードと同時に保存すること")
    fun shouldSaveExistingCardAndNewCardWhenArchivedStampsToReward() {
        // GIVEN
        val membership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        )
        val currentCardId = 1L
        val oldCard = Card(membership).apply { id = 0L }
        val currentCard = Card(membership, 2).apply { id = currentCardId }
        membership.addCard(oldCard)
        membership.addCard(currentCard)
        val stamp = Stamp("http://example.com/stamp.png")
        val targetStampsToReward = 30
        repeat(targetStampsToReward) {
            oldCard.addStampHistory(StampHistory(oldCard, stamp))
        }
        repeat(targetStampsToReward - 1) {
            currentCard.addStampHistory(StampHistory(currentCard, stamp))
        }

        // WHEN
        this.sut.stamp(membership, listOf(stamp), targetStampsToReward)

        // THEN
        argumentCaptor<Set<Card>>().apply {
            verify(repository).saveAll(capture())
            Assertions.assertNotNull(firstValue)
            for (card in firstValue.toSet()) {
                if (card.id == currentCardId) {
                    Assertions.assertEquals(targetStampsToReward, card.countStampHistories())
                } else {
                    Assertions.assertNull(card.id)
                    Assertions.assertEquals(0, card.countStampHistories())
                }
            }
        }
    }

    @Test
    @DisplayName("[正常系] スタンプが規定の数に達さない場合に、既存カードのみ保存すること")
    fun shouldSaveExistingCardWhenNotArchivedStampsToReward() {
        // GIVEN
        val membership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        )
        val currentCardId = 1L
        val oldCard = Card(membership).apply { id = 0L }
        val currentCard = Card(membership, 2).apply { id = currentCardId }
        membership.addCard(oldCard)
        membership.addCard(currentCard)
        val stamp = Stamp("http://example.com/stamp.png")
        val targetStampsToReward = 30
        val currentStamps = targetStampsToReward - 2
        repeat(targetStampsToReward) {
            oldCard.addStampHistory(StampHistory(oldCard, stamp))
        }
        repeat(currentStamps) {
            currentCard.addStampHistory(StampHistory(currentCard, stamp))
        }

        // WHEN
        this.sut.stamp(membership, listOf(stamp), targetStampsToReward)

        // THEN
        argumentCaptor<Card>().apply {
            verify(repository).save(capture())
            Assertions.assertNotNull(firstValue)
            Assertions.assertEquals(currentCardId, firstValue.id)
            Assertions.assertEquals(currentStamps + 1, firstValue.countStampHistories())
        }
    }
}