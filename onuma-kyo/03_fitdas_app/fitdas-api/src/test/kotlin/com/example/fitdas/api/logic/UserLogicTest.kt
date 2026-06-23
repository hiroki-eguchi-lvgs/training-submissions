package com.example.fitdas.api.logic

import com.example.fitdas.api.domain.MigratingStatus
import com.example.fitdas.api.domain.User
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.exception.BusinessException
import com.example.fitdas.api.infrastructure.UserRepository
import org.junit.jupiter.api.*
import org.mockito.kotlin.*
import java.util.*

class UserLogicTest {

    private lateinit var sut: UserLogic
    private lateinit var repository: UserRepository

    @BeforeEach
    fun setUp() {
        this.repository = mock()
        this.sut = UserLogic(repository)
    }

    // ========================================
    // 観点: 更新 - updateUser()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在する場合、migratingStamps,migratingStatus更新済のUserを引数としてsave()が呼び出される")
    fun shouldUpdateUserWhenExists() {
        // GIVEN
        val targetId = 1L
        val targetMigratingStamps = 10
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.PENDING,
            migratingStamps = 10
        ).apply { this.id = targetId }

        whenever(this.repository.findById(targetId))
            .thenReturn(Optional.of(user))
        whenever(this.repository.save(any()))
            .thenAnswer { invocation -> invocation.arguments[0] as User }

        // WHEN
        this.sut.updateUser(targetId, targetMigratingStamps)

        // THEN
        argumentCaptor<User>().apply {
            verify(repository).save(capture())
            Assertions.assertNotNull(firstValue)
            Assertions.assertEquals(targetMigratingStamps, firstValue.migratingStamps)
            Assertions.assertEquals(MigratingStatus.MIGRATING, firstValue.migratingStatus)
        }
    }

    @Test
    @DisplayName("[正常系] 指定したIDのユーザーが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenUserDoesNotExist() {
        // GIVEN
        val targetId = 1L
        whenever(this.repository.findById(targetId)).thenReturn(Optional.empty())
        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.updateUser(targetId, 10)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("ユーザーが見つかりません", exception.message)
    }

    // ========================================
    // 観点: イベントを元に更新 - updateUserOnStampMigrated()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在する場合、migratingStatus更新済のUserを引数としてsave()が呼び出される")
    fun shouldUpdateUserOnStampMigrated() {
        // GIVEN
        val targetId = 1L
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.MIGRATING,
            migratingStamps = 10
        ).apply { this.id = targetId }
        val event = UserStampMigratedEvent(targetId, MigratingStatus.MIGRATED, migratingStamps = 0)

        whenever(this.repository.findById(targetId))
            .thenReturn(Optional.of(user))
        whenever(this.repository.save(any()))
            .thenAnswer { invocation -> invocation.arguments[0] as User }

        // WHEN
        this.sut.updateUserOnStampMigrated(event)

        // THEN
        argumentCaptor<User>().apply {
            verify(repository).save(capture())
            Assertions.assertNotNull(firstValue)
            Assertions.assertEquals(event.status, firstValue.migratingStatus)
        }
    }

    @Test
    @DisplayName("[正常系] 指定したIDのユーザーが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenUserDoesNotExistForUpdateUserOnStampMigrated() {
        // GIVEN
        val targetId = 1L
        val event = UserStampMigratedEvent(targetId, MigratingStatus.MIGRATED, migratingStamps = 0)
        whenever(this.repository.findById(targetId)).thenReturn(Optional.empty())
        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.updateUserOnStampMigrated(event)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("ユーザーが見つかりません", exception.message)
    }
}