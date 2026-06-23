package com.example.fitdas.api.domain

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import java.time.LocalTime

class RoleAssignmentTest {

    // ========================================
    // 観点: 指定された - hasRole()
    // ========================================
    @Test
    @DisplayName("[正常系] 紐づくRoleが指定されたRoleCodeと一致する場合、true")
    fun shouldReturnTrueWhenCodeMatched() {
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
        val role = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val roleAssignment = RoleAssignment(membership, role)

        // WHEN&THEN
        Assertions.assertTrue(roleAssignment.hasRole(RoleCode.ROLE_STAMP_ISSUER))
    }

    @Test
    @DisplayName("[正常系] 紐づくRoleが指定されたRoleCodeと一致しない場合、false")
    fun shouldReturnFalseWhenCodeNotMatched() {
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
        val role = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val roleAssignment = RoleAssignment(membership, role)

        // WHEN&THEN
        Assertions.assertFalse(roleAssignment.hasRole(RoleCode.ROLE_REWARD_MANAGER))
    }
}