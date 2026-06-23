package com.example.fitdas.api.domain

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.time.LocalTime

class CardTest {

    // ========================================
    // 観点: 紐付けられたStampHistoryをカウント - countStampHistories()
    // ========================================
    @Test
    @DisplayName("[正常系] 紐付けられたStampHistoryの数を返すこと")
    fun shouldCountStampHistories() {
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
        val card = Card(membership)
        val stamp = Stamp(
            "http://example.com/stamp.png"
        )
        card.addStampHistory(StampHistory(card, stamp))
        card.addStampHistory(StampHistory(card, stamp))
        card.addStampHistory(StampHistory(card, stamp))
        card.addStampHistory(StampHistory(card, stamp))
        card.addStampHistory(StampHistory(card, stamp))
        card.addStampHistory(StampHistory(card, stamp))
        // WHEN&THEN
        Assertions.assertEquals(6, card.countStampHistories())
    }

    // ========================================
    // 観点: 新カードを作成 - createNewCard()
    // ========================================
    @Test
    @DisplayName("[正常系] 紐付けられた指定されたメンバーシップが紐づく次の世代のカードを返すこと")
    fun shouldReturnNextGenerationCard() {
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
        val currentGeneration = 1
        val currentCardId = 1L
        val card = Card(membership, currentGeneration).apply { id = currentCardId }
        // WHEN
        val actual = card.createNewCard()

        // THEN
        Assertions.assertEquals(membership, actual.membership)
        Assertions.assertEquals(currentGeneration + 1, actual.generation)
        Assertions.assertEquals(0, actual.countStampHistories())
        Assertions.assertNull(actual.id)
    }

    // ========================================
    // 観点: スタンプ移行してカード作成 - createNewCardWithMigration()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定されたmigratingStampsの数だけStampHistoryが紐づいたCardが返ること")
    fun shouldReturnCardWithMigratedStampHistory() {
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
        val migratingStamps = 15
        val stamp = Stamp(
            "http://example.com/stamp.png"
        )
        // WHEN
        val actual = Card.createNewCardWithMigration(membership, migratingStamps, listOf(stamp))

        // THEN
        Assertions.assertEquals(membership, actual.membership)
        Assertions.assertEquals(1, actual.generation)
        Assertions.assertEquals(migratingStamps, actual.countStampHistories())
    }

}