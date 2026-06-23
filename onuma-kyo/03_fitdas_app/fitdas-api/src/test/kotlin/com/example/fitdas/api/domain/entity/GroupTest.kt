package com.example.fitdas.api.domain.entity

import com.example.fitdas.api.exception.BusinessException
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalTime

class GroupTest {

    // ========================================
    // 観点: MembershipのIdをキーとして取得 - findMembershipById()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したIdのMembershipを取得できること")
    fun shouldReturnMembershipById() {
        // GIVEN
        val targetMembershipId = 0L
        val nonTargetMembershipId = 1L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val targetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply {
            this.id = targetMembershipId
        }
        val nonTargetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply { id = nonTargetMembershipId }
        group.addMembership(targetMembership)
        group.addMembership(nonTargetMembership)

        // WHEN
        val actual = group.findMembershipById(targetMembershipId)

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertEquals(targetMembership, actual)
    }

    @Test
    @DisplayName("[正常系] 指定したIdのメンバーが存在しない場合、BusinessExceptionがスローされる")
    fun shouldThrowsBusinessExceptionWhenNoMemberCorrespondingToId() {
        // GIVEN
        val targetMembershipId = 0L
        val nonTargetMembershipId = 1L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val nonTargetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply { id = nonTargetMembershipId }
        group.addMembership(nonTargetMembership)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            group.findMembershipById(targetMembershipId)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("指定されたIDのメンバーが存在しません", exception.message)
    }

    // ========================================
    // 観点: UserのIdをキーとして取得 - findMembershipByUserId()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したユーザーIdのMembershipを取得できること")
    fun shouldReturnMembershipByUserId() {
        // GIVEN
        val targetUserId = 0L
        val nonTargetUesrId = 1L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val targetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ).apply { id = targetUserId },
            group
        ).apply {
            this.id = 10L
        }
        val nonTargetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ).apply { id = nonTargetUesrId },
            group
        ).apply { id = 11L }
        group.addMembership(targetMembership)
        group.addMembership(nonTargetMembership)

        // WHEN
        val actual = group.findMembershipByUserId(targetUserId)

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertEquals(targetMembership, actual)
    }

    @Test
    @DisplayName("[正常系] 指定したユーザーIdのメンバーが存在しない場合、BusinessExceptionがスローされる")
    fun shouldThrowsBusinessExceptionWhenNoMemberCorrespondingToUserId() {

        // GIVEN
        val targetUserId = 0L
        val nonTargetUesrId = 1L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val nonTargetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ).apply { id = nonTargetUesrId },
            group
        ).apply { id = 11L }
        group.addMembership(nonTargetMembership)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            group.findMembershipByUserId(targetUserId)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("指定されたユーザーIDのメンバーが存在しません", exception.message)
    }

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

        val targetMembershipId = 0L
        val nonTargetMembershipId = 1L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val targetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply {
            this.id = targetMembershipId
        }
        val nonTargetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply { id = nonTargetMembershipId }
        group.addMembership(targetMembership)
        group.addMembership(nonTargetMembership)
        val targetRoleAssignment = RoleAssignment(targetMembership, stampIssuerRole)
        targetMembership.addRoleAssignment(targetRoleAssignment)
        nonTargetMembership.addRoleAssignment(RoleAssignment(nonTargetMembership, rewardManagerRole))

        // WHEN
        val actual = group.findRoleAssignment(RoleCode.ROLE_STAMP_ISSUER)

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertEquals(targetRoleAssignment, actual)
    }

    @Test
    @DisplayName("[正常系] 指定したcodeのRoleAssignmentが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenRoleAssignmentNotFound() {
        // GIVEN
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val rewardManagerRole = Role(
            code = RoleCode.ROLE_REWARD_MANAGER,
            name = "ご褒美係"
        )

        val stampIssuerMembershipId = 0L
        val rewardManagerMembershipId = 1L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val targetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply {
            this.id = stampIssuerMembershipId
        }
        val nonTargetMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply { id = rewardManagerMembershipId }
        group.addMembership(targetMembership)
        group.addMembership(nonTargetMembership)
        targetMembership.addRoleAssignment(RoleAssignment(targetMembership, stampIssuerRole))
        nonTargetMembership.addRoleAssignment(RoleAssignment(nonTargetMembership, rewardManagerRole))

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            group.findRoleAssignment(RoleCode.ROLE_ADMIN)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("ロール:${RoleCode.ROLE_ADMIN}のメンバーが存在しません", exception.message)
    }

    // ========================================
    // 観点: 紐付けられたMembershipをGraphQLの型クラスに変換 - toGraphQLMemberships()
    // ========================================
    @Test
    @DisplayName("[正常系] 紐付けられたMembershipを元に変換されたGraphQLの型クラスのインスタンス一覧が返されること")
    fun shouldReturnGraphQLMemberships() {
        // GIVEN
        val firstUserId = 0L
        val secondUserId = 1L
        val firstMembershipId = 10L
        val secondMembershipId = 11L

        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val firstMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ).apply { id = firstUserId },
            group
        ).apply {
            this.id = firstMembershipId
        }
        val secondMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ).apply { id = secondUserId },
            group
        ).apply { id = secondMembershipId }
        group.addMembership(firstMembership)
        group.addMembership(secondMembership)
        val expectedMemberships = listOf(firstMembership.toGraphQLMembership(), secondMembership.toGraphQLMembership())

        // WHEN
        val actual = group.toGraphQLMemberships()

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertEquals(expectedMemberships, actual)
    }

}