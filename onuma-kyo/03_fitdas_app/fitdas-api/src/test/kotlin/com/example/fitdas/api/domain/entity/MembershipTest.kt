package com.example.fitdas.api.domain.entity

import com.example.fitdas.api.exception.BusinessException
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalTime

class MembershipTest {


    // ========================================
    // 観点: MembershipのIdをキーとして取得 - findRoleAssignment()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したcodeのRoleAssignmentを取得できること")
    fun shouldReturnRoleAssignmentByCode() {
        // GIVEN
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val rewardManagerRole = Role(
            code = RoleCode.ROLE_REWARD_MANAGER,
            name = "ご褒美係"
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
        val targetRoleAssignment = RoleAssignment(membership, stampIssuerRole)
        membership.addRoleAssignment(targetRoleAssignment)
        membership.addRoleAssignment(RoleAssignment(membership, rewardManagerRole))

        // WHEN
        val actual = membership.findRoleAssignment(RoleCode.ROLE_STAMP_ISSUER)

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertEquals(targetRoleAssignment, actual)
    }


    @Test
    @DisplayName("[正常系] 指定したcodeのRoleAssignmentが存在しない場合、nullを返すこと")
    fun shouldReturnNullWhenRoleAssignmentNotExists() {
        // GIVEN
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val rewardManagerRole = Role(
            code = RoleCode.ROLE_REWARD_MANAGER,
            name = "ご褒美係"
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
        membership.addRoleAssignment(RoleAssignment(membership, stampIssuerRole))
        membership.addRoleAssignment(RoleAssignment(membership, rewardManagerRole))

        // WHEN
        val actual = membership.findRoleAssignment(RoleCode.ROLE_ADMIN)

        // THEN
        Assertions.assertNull(actual)
    }

    // ========================================
    // 観点: MembershipのGraphQL向け型クラスに変換 - toGraphQLMembership()
    // ========================================
    @Test
    @DisplayName("[正常系] GraphQLの型クラスのインスタンスが返されること")
    fun shouldReturnGraphQLMemberships() {
        // GIVEN
        val targetUserId = 0L
        val targetMembershipId = 10L
        val membership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ).apply { id = targetUserId },
            Group(
                name = "test group",
                scheduledStartAt = LocalTime.of(1, 0, 0),
                slackChannelUrl = "http://slack.com",
                stampsToReward = 10,
            )
        ).apply {
            id = targetMembershipId
        }

        // WHEN
        val actual = membership.toGraphQLMembership()

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertEquals(targetMembershipId.toString(), actual.id)
        Assertions.assertEquals(targetUserId.toString(), actual.userId)
        Assertions.assertTrue(actual.roles.isEmpty())
    }

    // ========================================
    // 観点: 現在のカードを取得 - getCurrentCard()
    // ========================================
    @Test
    @DisplayName("[正常系] 紐づくCardのうちgenerationが最大のCardが返却されること")
    fun shouldReturnCardWithBiggestGeneration() {
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
        val targetCard = Card(membership, 3)
        membership.addCard(targetCard)
        membership.addCard(Card(membership, 1))
        membership.addCard(Card(membership, 2))

        // WHEN
        val actual = membership.getCurrentCard()

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertEquals(targetCard, actual)
    }

    @Test
    @DisplayName("[異常系] 紐づくCardが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenCardsIsEmpty() {
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

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            membership.getCurrentCard()
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("カードが存在しません", exception.message)
    }
}