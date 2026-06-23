package com.example.fitdas.api.service

import com.example.fitdas.api.domain.*
import com.example.fitdas.api.infrastructure.RoleAssignmentRepository
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.LocalTime

class RoleAssignmentQueryServiceImplTest {
    private lateinit var sut: RoleAssignmentQueryService
    private lateinit var repository: RoleAssignmentRepository

    @BeforeEach
    fun setUp() {
        this.repository = mock()
        this.sut = RoleAssignmentQueryServiceImpl(repository)
    }

    // ========================================
    // 観点: 複数取得 - findAllByMembershipIds()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したmembershipIDに紐づくRoleAssignmentがDBに存在する場合、key:id,value:RoleCodeリストのマップが返されること")
    fun shouldReturnRoleCodesToMembershipIdWhenExists() {
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
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val rewardManagerRole = Role(
            code = RoleCode.ROLE_REWARD_MANAGER,
            name = "ご褒美係"
        )
        val stampIssuerRoleAssignment = RoleAssignment(firstMembership, stampIssuerRole)
        firstMembership.addRoleAssignment(stampIssuerRoleAssignment)
        val rewardManagerRoleAssignment = RoleAssignment(firstMembership, rewardManagerRole)
        firstMembership.addRoleAssignment(rewardManagerRoleAssignment)

        whenever(this.repository.findAllWithRolesByMembershipIds(targetIds))
            .thenReturn(
                listOf(
                    stampIssuerRoleAssignment,
                    rewardManagerRoleAssignment,
                )
            )

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findAllByMembershipIds(targetIds)

        // THEN GraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(
            mapOf(
                firstTargetId to listOf(
                    com.example.fitdas.api.codegen.types.RoleCode.ROLE_STAMP_ISSUER,
                    com.example.fitdas.api.codegen.types.RoleCode.ROLE_REWARD_MANAGER,
                ),
                secondTargetId to listOf<com.example.fitdas.api.codegen.types.RoleCode>(),
                thirdTargetId to listOf<com.example.fitdas.api.codegen.types.RoleCode>()
            ),
            result
        )
    }

    @Test
    @DisplayName("[境界値] 指定したIDのデータが存在しない場合、key:id,value:RoleCodeのマップが返されること")
    fun shouldReturnEmptyListToMembershipIdWhenNotExists() {
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

        whenever(this.repository.findAllWithRolesByMembershipIds(targetIds))
            .thenReturn(
                listOf(
                )
            )

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findAllByMembershipIds(targetIds)

        // THEN GraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(
            mapOf(
                firstTargetId to listOf<com.example.fitdas.api.codegen.types.RoleCode>(),
                secondTargetId to listOf<com.example.fitdas.api.codegen.types.RoleCode>(),
                thirdTargetId to listOf<com.example.fitdas.api.codegen.types.RoleCode>()
            ),
            result
        )
    }
}