package com.example.fitdas.api.service

import com.example.fitdas.api.codegen.types.Card
import com.example.fitdas.api.domain.*
import com.example.fitdas.api.infrastructure.CardRepository
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.LocalTime

class CardQueryServiceImplTest {
    private lateinit var sut: CardQueryService
    private lateinit var repository: CardRepository

    @BeforeEach
    fun setUp() {
        this.repository = mock()
        this.sut = CardQueryServiceImpl(repository)
    }

    // ========================================
    // 観点: 複数取得 - findMaxGenerationCardsByMemberships()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したmembershipIDに紐づくカードがDBに存在する場合、key:id,value:Cardのマップが返されること")
    fun shouldReturnIDToCardMapByIdsWhenExists() {
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
        ).apply { this.id = firstTargetId }
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
        ).apply { this.id = secondTargetId }
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
        ).apply { this.id = thirdTargetId }
        firstMembership.addCard(Card(firstMembership).apply { id = 0L })
        val currentCardOfFirstMembershipId = 1L
        val currentCardOfFirstMembership =
            Card(firstMembership, 2).apply { id = currentCardOfFirstMembershipId }
        firstMembership.addCard(currentCardOfFirstMembership)

        secondMembership.addCard(Card(secondMembership, 1).apply { id = 2L })
        secondMembership.addCard(Card(secondMembership, 2).apply { id = 3L })
        val currentCardOfSecondMembershipId = 4L
        val currentCardOfSecondMembership =
            Card(secondMembership, 3).apply { id = currentCardOfSecondMembershipId }
        secondMembership.addCard(currentCardOfSecondMembership)

        val currentCardOfThirdMembershipId = 5L
        val currentCardOfThirdMembership =
            Card(thirdMembership, 1).apply { id = currentCardOfThirdMembershipId }
        thirdMembership.addCard(currentCardOfThirdMembership)

        whenever(this.repository.findMaxGenerationCardsByMemberships(targetIds))
            .thenReturn(
                setOf(
                    currentCardOfFirstMembership,
                    currentCardOfSecondMembership,
                    currentCardOfThirdMembership
                )
            )

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findMaxGenerationCardsByMemberships(targetIds)

        // THEN Logicから、モックで設定したCardがGraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(
            mapOf(
                firstTargetId to Card(
                    id = currentCardOfFirstMembership.id.toString(),
                    generation = currentCardOfFirstMembership.generation,
                    stampHistories = emptyList()
                ),
                secondTargetId to Card(
                    id = currentCardOfSecondMembership.id.toString(),
                    generation = currentCardOfSecondMembership.generation,
                    stampHistories = emptyList()
                ),
                thirdTargetId to Card(
                    id = currentCardOfThirdMembership.id.toString(),
                    generation = currentCardOfThirdMembership.generation,
                    stampHistories = emptyList()
                )

            ),
            result
        )
    }

    @Test
    @DisplayName("[境界値] 指定したIDのデータが存在しない場合、空のマップが返されること")
    fun shouldReturnEmptyMapWhenUsersNotFound() {
        val firstTargetId = 1L
        val secondTargetId = 2L
        val thirdTargetId = 3L
        val targetIds = setOf(firstTargetId, secondTargetId, thirdTargetId)
        whenever(this.repository.findMaxGenerationCardsByMemberships(targetIds))
            .thenReturn(setOf<com.example.fitdas.api.domain.Card>())

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findMaxGenerationCardsByMemberships(targetIds)

        // THEN モックで設定したCardがGraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(
            mapOf<Long, Card>(),
            result
        )

    }
}