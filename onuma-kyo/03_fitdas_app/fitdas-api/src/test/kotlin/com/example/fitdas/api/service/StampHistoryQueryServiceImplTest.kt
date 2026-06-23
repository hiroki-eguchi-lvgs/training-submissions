package com.example.fitdas.api.service

import com.example.fitdas.api.common.extension.toJST
import com.example.fitdas.api.domain.*
import com.example.fitdas.api.infrastructure.StampHistoryRepository
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Instant
import java.time.LocalTime

class StampHistoryQueryServiceImplTest {

    companion object {
        private val FIXED_INSTANT: Instant = Instant.parse("2026-06-23T10:00:00Z")
    }

    private lateinit var sut: StampHistoryQueryService
    private lateinit var repository: StampHistoryRepository

    @BeforeEach
    fun setUp() {
        this.repository = mock()
        this.sut = StampHistoryQueryServiceImpl(repository)
    }

    // ========================================
    // 観点: 複数取得 - findAllByCardIds()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したcardIDに紐づくStampHistoryがDBに存在する場合、key:id,value:types.StampHistoryのマップが返されること")
    fun shouldReturnCardIdToStampHistoriesWhenExists() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val firstTargetId = 1L
        val secondTargetId = 2L
        val thirdTargetId = 3L
        val targetIds = setOf(firstTargetId, secondTargetId, thirdTargetId)
        val firstMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATED,
                migratingStamps = 1
            ),
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        )
        val secondMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATED,
                migratingStamps = 1
            ),
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        )
        val thirdMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATED,
                migratingStamps = 1
            ),
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        )
        val firstCard = com.example.fitdas.api.domain.Card(firstMembership).apply { id = firstTargetId }
        val secondCard = com.example.fitdas.api.domain.Card(secondMembership).apply { id = secondTargetId }
        val thirdCard = com.example.fitdas.api.domain.Card(thirdMembership).apply { id = thirdTargetId }
        val stamp = Stamp("http://example.com/stamp.png")

        val stampHistory1 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory2 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory3 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory4 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory5 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory6 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory7 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory8 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory9 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory10 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory11 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory12 = StampHistory(firstCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory13 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory14 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory15 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory16 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory17 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory18 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory19 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }
        val stampHistory20 = StampHistory(secondCard, stamp).apply { createdAt = FIXED_INSTANT }

        whenever(this.repository.findAllWithStampsByCardIds(targetIds))
            .thenReturn(
                listOf(
                    stampHistory1,
                    stampHistory2,
                    stampHistory3,
                    stampHistory4,
                    stampHistory5,
                    stampHistory6,
                    stampHistory7,
                    stampHistory8,
                    stampHistory9,
                    stampHistory10,
                    stampHistory11,
                    stampHistory12,
                    stampHistory13,
                    stampHistory14,
                    stampHistory15,
                    stampHistory16,
                    stampHistory17,
                    stampHistory18,
                    stampHistory19,
                    stampHistory20,
                )
            )

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findAllByCardIds(targetIds)

        // THEN Logicから、モックで設定したCardがGraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(
            mapOf(
                firstTargetId to listOf(
                    toGraphQlStampHistory(stampHistory1),
                    toGraphQlStampHistory(stampHistory2),
                    toGraphQlStampHistory(stampHistory3),
                    toGraphQlStampHistory(stampHistory4),
                    toGraphQlStampHistory(stampHistory5),
                    toGraphQlStampHistory(stampHistory6),
                    toGraphQlStampHistory(stampHistory7),
                    toGraphQlStampHistory(stampHistory8),
                    toGraphQlStampHistory(stampHistory9),
                    toGraphQlStampHistory(stampHistory10),
                    toGraphQlStampHistory(stampHistory11),
                    toGraphQlStampHistory(stampHistory12),
                ),
                secondTargetId to listOf(
                    toGraphQlStampHistory(stampHistory13),
                    toGraphQlStampHistory(stampHistory14),
                    toGraphQlStampHistory(stampHistory15),
                    toGraphQlStampHistory(stampHistory16),
                    toGraphQlStampHistory(stampHistory17),
                    toGraphQlStampHistory(stampHistory18),
                    toGraphQlStampHistory(stampHistory19),
                    toGraphQlStampHistory(stampHistory20),
                ),
                thirdTargetId to emptyList<com.example.fitdas.api.codegen.types.Card>()
            ),
            result
        )
    }

    @Test
    @DisplayName("[境界値] 指定したIDのデータが存在しない場合、空のマップが返されること")
    fun shouldReturnCardIdToEmptyListWhenNotExists() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val firstTargetId = 1L
        val secondTargetId = 2L
        val thirdTargetId = 3L
        val targetIds = setOf(firstTargetId, secondTargetId, thirdTargetId)
        whenever(this.repository.findAllWithStampsByCardIds(targetIds))
            .thenReturn(emptyList<StampHistory>())

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findAllByCardIds(targetIds)

        // THEN Logicから、モックで設定したCardがGraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(
            mapOf(
                firstTargetId to emptyList<com.example.fitdas.api.codegen.types.Card>(),
                secondTargetId to emptyList<com.example.fitdas.api.codegen.types.Card>(),
                thirdTargetId to emptyList<com.example.fitdas.api.codegen.types.Card>()
            ),
            result
        )
    }


    private fun toGraphQlStampHistory(stampHistory: StampHistory): com.example.fitdas.api.codegen.types.StampHistory {
        return com.example.fitdas.api.codegen.types.StampHistory(
            stampImagePath = stampHistory.stamp.imagePath,
            createdAt = stampHistory.createdAt!!.toJST()
        )
    }
}