package com.example.fitdas.api.domain.entity

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

class RoleTest {


    // ========================================
    // 観点: 指定された - isCode()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定されたRoleCodeと一致する場合、true")
    fun shouldReturnTrueWhenCodeMatched() {
        // GIVEN
        val role = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )

        // WHEN&THEN
        Assertions.assertTrue(role.isCode(RoleCode.ROLE_STAMP_ISSUER))
    }

    @Test
    @DisplayName("[正常系] 指定されたRoleCodeと一致しない場合、false")
    fun shouldReturnFalseWhenCodeNotMatched() {
        // GIVEN
        val role = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )

        // WHEN&THEN
        Assertions.assertFalse(role.isCode(RoleCode.ROLE_REWARD_MANAGER))
    }
}