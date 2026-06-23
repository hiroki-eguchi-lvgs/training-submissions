package com.example.fitdas.api.service

import com.example.fitdas.api.domain.entity.MigratingStatus
import com.example.fitdas.api.domain.entity.User
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.domain.logic.UserLogic
import com.example.fitdas.api.exception.BusinessException
import org.junit.jupiter.api.*
import org.mockito.ArgumentCaptor
import org.mockito.Mockito
import org.mockito.kotlin.capture
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever

class UserServiceImplTest {
    private lateinit var sut: UserService
    private lateinit var userLogic: UserLogic

    @BeforeEach
    fun setUp() {
        this.userLogic = mock()
        this.sut = UserServiceImpl(userLogic)
    }

    // ========================================
    // 観点: 単一取得 - user()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在する場合、Userが返されること")
    fun shouldReturnUserByIdWhenExists() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val targetId = 1L
        val targetName = "testUser"
        val expectedUser = User(
            name = targetName,
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.MIGRATING,
            migratingStamps = 10
        ).apply { this.id = targetId }

        whenever(this.userLogic.findById(targetId))
            .thenReturn(expectedUser)

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.user(targetId)

        // THEN Logicから、モックと同様のUserが返却されること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(expectedUser, result)
        Assertions.assertEquals(targetId, result!!.id)
        Assertions.assertEquals(targetName, result.name)
    }

    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenUserNotFound() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val targetId = 1L
        whenever(this.userLogic.findById(targetId))
            .thenReturn(null)
        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.user(targetId)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("ユーザーが見つかりません", exception.message)
    }

    // ========================================
    // 観点: 複数取得 - findAllByIds()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在する場合、key:id,value:type.Userのマップが返されること")
    fun shouldReturnIDToUserMapByIdsWhenExists() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val firstTargetId = 1L
        val secondTargetId = 2L
        val thirdTargetId = 3L
        val targetIds = setOf(firstTargetId, secondTargetId, thirdTargetId)
        val targetName = "testUser"
        val firstExpectedUser = User(
            name = targetName + firstTargetId.toString(),
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
        ).apply { this.id = firstTargetId }
        val secondExpectedUser = User(
            name = targetName + secondTargetId.toString(),
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
        ).apply { this.id = secondTargetId }
        val thirdExpectedUser = User(
            name = targetName + thirdTargetId.toString(),
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
        ).apply { this.id = thirdTargetId }

        whenever(this.userLogic.findAllByIds(targetIds))
            .thenReturn(listOf(firstExpectedUser, secondExpectedUser, thirdExpectedUser))

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findAllByIds(targetIds)

        // THEN Logicから、モックで設定したUserがGraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(
            mapOf(
                firstTargetId to firstExpectedUser.toGraphQLUser(),
                secondTargetId to secondExpectedUser.toGraphQLUser(),
                thirdTargetId to thirdExpectedUser.toGraphQLUser()
            ),
            result
        )
    }

    @Test
    @DisplayName("[境界値] 指定したIDのデータが存在しない場合、空のマップが返されること")
    fun shouldReturnEmptyMapWhenUsersNotFound() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val firstTargetId = 1L
        val secondTargetId = 2L
        val thirdTargetId = 3L
        val targetIds = setOf(firstTargetId, secondTargetId, thirdTargetId)
        whenever(this.userLogic.findAllByIds(targetIds))
            .thenReturn(listOf<User>())

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.findAllByIds(targetIds)

        // THEN Logicから、モックと同様のOwnerが返却されること
        Assertions.assertNotNull(result)
        // モックで設定したUserがGraphQLのtypeクラスに変換され、かつ、正しいIDと紐づけられていること
        Assertions.assertEquals(
            mapOf<Long, com.example.fitdas.api.codegen.types.User>(),
            result,
        )
    }

    // ========================================
    // 観点: 更新 - updateUser()
    // ========================================
    @Test
    @DisplayName("[正常系] 正しい引数でLogicが呼び出されるかつ戻り値があること")
    fun shouldCallLogicWithCorrectArgumentsAndReturnValue() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val targetId = 1L
        val targetMigratingStamps = 10
        whenever(this.userLogic.updateUser(targetId, targetMigratingStamps))
            .thenReturn(
                User(
                    name = "testUser",
                    googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                ).apply { this.id = targetId })

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.updateUser(targetId, targetMigratingStamps)

        // THEN 戻り値があること
        Assertions.assertNotNull(result)
        // THEN 引数でLogicのupdateUserが呼び出されること
        val longCaptor: ArgumentCaptor<Long> = ArgumentCaptor.forClass(Long::class.java)
        val intCaptor: ArgumentCaptor<Int> = ArgumentCaptor.forClass(Int::class.java)
        Mockito.verify(userLogic, Mockito.times(1))
            .updateUser(capture(longCaptor), capture(intCaptor))
        Assertions.assertEquals(targetId, longCaptor.value)
        Assertions.assertEquals(targetMigratingStamps, intCaptor.value)
    }

    // ========================================
    // 観点: イベント駆動の更新 - completeStampMigration()
    // ========================================
    @Test
    @DisplayName("[正常系] 正しい引数で、Logicが呼び出させること")
    fun shouldCallLogicWithCorrectArguments() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val event = UserStampMigratedEvent(
            1L, MigratingStatus.MIGRATING, 10
        )
        // WHEN Serviceクラスを呼び出す
        val result = this.sut.completeStampMigration(event)
        // THEN ただし引数でLogicのupdateUserOnStampMigratedが呼び出されること
        val eventCaptor: ArgumentCaptor<UserStampMigratedEvent> =
            ArgumentCaptor.forClass(UserStampMigratedEvent::class.java)
        Mockito.verify(userLogic, Mockito.times(1))
            .updateUserOnStampMigrated(capture(eventCaptor))
        Assertions.assertEquals(event, eventCaptor.value)
    }
}