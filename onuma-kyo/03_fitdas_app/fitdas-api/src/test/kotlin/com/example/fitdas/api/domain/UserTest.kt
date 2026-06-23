package com.example.fitdas.api.domain

import com.example.fitdas.api.codegen.types.User
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDateTime
import java.time.ZoneOffset

class UserTest {

    // ========================================
    // 観点: GraphQLの型クラスへの変換 - toGraphQLUser()
    // ========================================
    @Test
    @DisplayName("[正常系] 変換されたcodegen.types.User型のインスタンスが返ること")
    fun shouldReturnCodegenTypesUser() {
        // GIVEN
        val targetId = 1L
        val targetName = "testUser"
        val user = User(
            name = targetName,
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.PENDING,
            migratingStamps = 10
        ).apply {
            this.id = targetId
            this.createdAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.updatedAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.version = 1
        }

        // WHEN
        val actual = user.toGraphQLUser()

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertTrue(actual is User)
        Assertions.assertEquals(targetId.toString(), actual.id)
        Assertions.assertEquals(targetName, actual.name)
    }

    // ========================================
    // 観点: UserStampMigratedEventへの変換 - toStampMigratedEvent()
    // ========================================
    @Test
    @DisplayName("[正常系] UserStampMigratedEventのインスタンスが返ること")
    fun shouldReturnUserStampMigratedEvent() {
        // GIVEN
        val targetId = 1L
        val targetMigratingStamps = 10
        val targetStatus = MigratingStatus.PENDING
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = targetStatus,
            migratingStamps = targetMigratingStamps
        ).apply {
            this.id = targetId
            this.createdAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.updatedAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.version = 1
        }

        // WHEN
        val actual = user.toStampMigratedEvent()

        // THEN
        Assertions.assertNotNull(actual)
        Assertions.assertTrue(actual is UserStampMigratedEvent)
        Assertions.assertEquals(targetId, actual.userId)
        Assertions.assertEquals(targetMigratingStamps, actual.migratingStamps)
        Assertions.assertEquals(targetStatus, actual.status)
    }

    @Test
    @DisplayName("[異常系] idがnullの場合に、NPEがスローされること")
    fun shouldThrowNullPointerExceptionWhenIdIsNull() {
        // GIVEN
        val targetMigratingStamps = 10
        val targetStatus = MigratingStatus.PENDING
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = targetStatus,
            migratingStamps = targetMigratingStamps
        ).apply {
            this.createdAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.updatedAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.version = 1
        }

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<NullPointerException> {
            user.toStampMigratedEvent()
        }
        Assertions.assertNotNull(exception)
    }

    @Test
    @DisplayName("[異常系] migratingStampsがnullの場合に、NPEがスローされること")
    fun shouldThrowNullPointerExceptionWhenMigratingStampsIsNull() {
        // GIVEN
        val targetId = 1L
        val targetStatus = MigratingStatus.PENDING
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = targetStatus,
        ).apply {
            this.id = targetId
            this.createdAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.updatedAt = LocalDateTime.now().toInstant(ZoneOffset.UTC)
            this.version = 1
        }

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<NullPointerException> {
            user.toStampMigratedEvent()
        }
        Assertions.assertNotNull(exception)
    }
}