package com.example.fitdas.api.service

import com.example.fitdas.api.codegen.types.GroupInput
import com.example.fitdas.api.domain.entity.*
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.domain.logic.CardLogic
import com.example.fitdas.api.domain.logic.GroupLogic
import com.example.fitdas.api.exception.BusinessException
import org.junit.jupiter.api.*
import org.mockito.kotlin.*
import org.springframework.context.ApplicationEventPublisher
import java.net.URI
import java.time.LocalTime

class GroupServiceImplTest {

    companion object {
        private val FIXED_INSTANT: LocalTime = LocalTime.of(12, 0)
    }

    private lateinit var sut: GroupService
    private lateinit var groupLogic: GroupLogic
    private lateinit var cardLogic: CardLogic
    private lateinit var eventPublisher: ApplicationEventPublisher

    @BeforeEach
    fun setUp() {
        this.groupLogic = mock()
        this.cardLogic = mock()
        this.eventPublisher = mock()
        this.sut = GroupServiceImpl(groupLogic, cardLogic, eventPublisher)
    }

    // ========================================
    // 観点: 単一取得 - group()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在する場合、Groupが返されること")
    fun shouldReturnGroupByIdWhenExists() {
        // GIVEN LogicがGroupを返却するようにモックを設定
        val targetId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val expectedGroup = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = "",
            stampsToReward = 10
        ).apply { this.id = targetId }

        whenever(this.groupLogic.findById(targetId))
            .thenReturn(expectedGroup)

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.group(targetId.toString())

        // THEN Logicから、モックと同様のUserが返却されること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(expectedGroup, result)
        Assertions.assertEquals(targetId, result!!.id)
    }

    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenUserNotFound() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val targetId = 1L
        whenever(this.groupLogic.findById(targetId))
            .thenReturn(null)
        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.group(targetId.toString())
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("グループが見つかりません", exception.message)
    }

    // ========================================
    // 観点: 単一取得 - groupWithMemberships()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在する場合、Groupが返されること")
    fun shouldReturnGroupWithMembershipsByIdWhenExists() {
        // GIVEN LogicがGroupを返却するようにモックを設定
        val targetId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val expectedGroup = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = "",
            stampsToReward = 10
        ).apply { this.id = targetId }

        whenever(this.groupLogic.findByIdWithMemberships(targetId))
            .thenReturn(expectedGroup)

        // WHEN Serviceクラスを呼び出す
        val result = this.sut.groupWithMemberships(targetId.toString())

        // THEN Logicから、モックと同様のUserが返却されること
        Assertions.assertNotNull(result)
        Assertions.assertEquals(expectedGroup, result)
        Assertions.assertEquals(targetId, result!!.id)
    }

    @Test
    @DisplayName("[正常系] 指定したIDがDBに存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenUserNotFoundForGroupWithMemberships() {
        // GIVEN LogicがUserを返却するようにモックを設定
        val targetId = 1L
        whenever(this.groupLogic.findByIdWithMemberships(targetId))
            .thenReturn(null)
        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.groupWithMemberships(targetId.toString())
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("グループが見つかりません", exception.message)
    }


    // ========================================
    // 観点: 新規作成 - createGroup()
    // ========================================
    @Test
    @DisplayName("[正常系]入力値が正常な場合、Logicが呼び出され戻り値が返却されること")
    fun shouldReturnSavedGroupWhenGroupInputIsValid() {
        // GIVEN
        val targetStampIssuerId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        )
        val stamp = Stamp(
            "http://example.com/stamp.png"
        )
        val groupStampAssignment = GroupStampAssignment(group, stamp)
        group.addGroupStampAssignment(groupStampAssignment)

        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger()
        ).apply { this.id = targetStampIssuerId }
        val membership = Membership(
            user = user,
            group = group
        )
        group.addMembership(membership)

        val event = UserStampMigratedEvent(
            userId = targetStampIssuerId,
            status = MigratingStatus.PENDING,
            migratingStamps = targetStampsToReward
        )

        whenever(this.groupLogic.validate(groupInput))
            .thenReturn(true)
        whenever(this.groupLogic.createGroup(targetStampIssuerId, groupInput))
            .thenReturn(GroupWrapper(group, event))
        whenever(this.cardLogic.createCard(membership, event, listOf(stamp)))
            .thenReturn(Card(membership, 1))

        // GIVEN
        val result = sut.createGroup(targetStampIssuerId, groupInput)

        // THEN
        Assertions.assertNotNull(result)
        verify(this.groupLogic).createGroup(targetStampIssuerId, groupInput)
        verify(this.cardLogic).createCard(membership, event, listOf(stamp))
        verify(eventPublisher, never()).publishEvent(any())
    }

    @Test
    @DisplayName("[正常系]入力値が不正な場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenGroupInputIsInvalid() {
        // GIVEN
        val targetStampIssuerId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        whenever(this.groupLogic.validate(groupInput))
            .thenReturn(false)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.createGroup(targetStampIssuerId, groupInput)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("入力値が不正です", exception.message)
    }

    @Test
    @DisplayName("[正常系]スタンプ移行ステータスがMigratingStatus.MIGRATINGの場合、イベントが発行されること")
    fun shouldPublishEventWhenStampMigrationStatusIsMigrating() {
        // GIVEN
        val targetStampIssuerId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        )
        val stamp = Stamp(
            "http://example.com/stamp.png"
        )
        val groupStampAssignment = GroupStampAssignment(group, stamp)
        group.addGroupStampAssignment(groupStampAssignment)

        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger()
        ).apply { this.id = targetStampIssuerId }
        val membership = Membership(
            user = user,
            group = group
        )
        group.addMembership(membership)

        val event = UserStampMigratedEvent(
            userId = targetStampIssuerId,
            status = MigratingStatus.MIGRATING,
            migratingStamps = targetStampsToReward
        )

        whenever(this.groupLogic.validate(groupInput))
            .thenReturn(true)
        whenever(this.groupLogic.createGroup(targetStampIssuerId, groupInput))
            .thenReturn(GroupWrapper(group, event))
        whenever(this.cardLogic.createCard(membership, event, listOf(stamp)))
            .thenReturn(Card(membership, 1))

        // GIVEN
        val result = sut.createGroup(targetStampIssuerId, groupInput)

        // THEN
        Assertions.assertNotNull(result)
        verify(this.groupLogic).createGroup(targetStampIssuerId, groupInput)
        verify(this.cardLogic).createCard(membership, event, listOf(stamp))
        verify(eventPublisher, times(1)).publishEvent(event.toMigrated())
    }

    // ========================================
    // 観点: 更新 - updateGroup()
    // ========================================
    @Test
    @DisplayName("[正常系]入力値が正常な場合、Logicが呼び出されること")
    fun shouldCallLogicUpdate() {
        // GIVEN
        val targetGroupId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        ).apply { this.id = targetGroupId }

        whenever(this.groupLogic.validate(groupInput))
            .thenReturn(true)
        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(group)

        // GIVEN
        val result = sut.updateGroup(targetGroupId.toString(), groupInput)

        // THEN
        verify(this.groupLogic).updateGroup(group, groupInput)
    }

    @Test
    @DisplayName("[正常系]入力値が不正な場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenInputIsInvalid() {
        // GIVEN
        val targetGroupId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        ).apply { this.id = targetGroupId }

        whenever(this.groupLogic.validate(groupInput))
            .thenReturn(false)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.updateGroup(targetGroupId.toString(), groupInput)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("入力値が不正です", exception.message)
    }

    @Test
    @DisplayName("[正常系]更新対象のGroupが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenGroupNotFound() {
        // GIVEN
        val targetGroupId = 1L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        ).apply { this.id = targetGroupId }

        whenever(this.groupLogic.validate(groupInput))
            .thenReturn(true)
        whenever(this.groupLogic.findById(targetGroupId)).thenReturn(null)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.updateGroup(targetGroupId.toString(), groupInput)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("グループが見つかりません", exception.message)
    }


    // ========================================
    // 観点: メンバー追加 - addMember()
    // ========================================
    @Test
    @DisplayName("[正常系]グループが存在する場合、Logicが呼び出され戻り値が返却されること")
    fun shouldReturnSavedGroupAndCallLogic() {
        // GIVEN
        val memberId = 1L
        val targetGroupId = 2L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        ).apply { this.id = targetGroupId }
        val stamp = Stamp(
            "http://example.com/stamp.png"
        )
        val groupStampAssignment = GroupStampAssignment(group, stamp)
        group.addGroupStampAssignment(groupStampAssignment)

        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger()
        ).apply { this.id = memberId }
        val membership = Membership(
            user = user,
            group = group
        )

        val event = UserStampMigratedEvent(
            userId = memberId,
            status = MigratingStatus.PENDING,
            migratingStamps = targetStampsToReward
        )

        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(group)
        whenever(this.groupLogic.addMember(group, memberId))
            .thenReturn(GroupWrapper(group.apply {
                this.addMembership(membership)
            }, event))
        whenever(this.cardLogic.createCard(membership, event, listOf(stamp)))
            .thenReturn(Card(membership, 1))

        // GIVEN
        val result = sut.addMember(targetGroupId.toString(), memberId)

        // THEN
        Assertions.assertNotNull(result)
        verify(this.groupLogic).addMember(group, memberId)
        verify(this.cardLogic).createCard(membership, event, listOf(stamp))
        verify(eventPublisher, never()).publishEvent(any())
    }

    @Test
    @DisplayName("[正常系]グループが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenGroupNotFoundForAddMember() {
        // GIVEN
        val memberId = 1L
        val targetGroupId = 2L

        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(null)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.addMember(targetGroupId.toString(), memberId)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("グループが見つかりません", exception.message)
    }

    @Test
    @DisplayName("[正常系]追加したユーザーがスタンプ移行中の場合、イベントが発行されること")
    fun shouldPublishEventWhenUserIsMigratingStamps() {
        // GIVEN
        val memberId = 1L
        val targetGroupId = 2L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        ).apply { this.id = targetGroupId }
        val stamp = Stamp(
            "http://example.com/stamp.png"
        )
        val groupStampAssignment = GroupStampAssignment(group, stamp)
        group.addGroupStampAssignment(groupStampAssignment)

        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger()
        ).apply { this.id = memberId }
        val membership = Membership(
            user = user,
            group = group
        )

        val event = UserStampMigratedEvent(
            userId = memberId,
            status = MigratingStatus.MIGRATING,
            migratingStamps = targetStampsToReward
        )

        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(group)
        whenever(this.groupLogic.addMember(group, memberId))
            .thenReturn(GroupWrapper(group.apply {
                this.addMembership(membership)
            }, event))
        whenever(this.cardLogic.createCard(membership, event, listOf(stamp)))
            .thenReturn(Card(membership, 1))

        // GIVEN
        val result = sut.addMember(targetGroupId.toString(), memberId)

        // THEN
        Assertions.assertNotNull(result)
        verify(this.groupLogic).addMember(group, memberId)
        verify(this.cardLogic).createCard(membership, event, listOf(stamp))
        verify(eventPublisher, times(1)).publishEvent(event.toMigrated())
    }

    // ========================================
    // 観点: メンバーのロール変更 - changeMemberRole()
    // ========================================
    @Test
    @DisplayName("[正常系]グループが存在する場合、Logicが呼び出され戻り値が返却されること")
    fun shouldReturnSavedGroupAndCallLogicChangeMemberRole() {
        val successorId = 1L
        val targetGroupId = 2L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        ).apply { this.id = targetGroupId }

        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(group)
        whenever(this.groupLogic.changeMemberRole(group, successorId, RoleCode.ROLE_STAMP_ISSUER))
            .thenReturn(group.apply { version = version?.plus(1) ?: 0 })

        // GIVEN
        val result = sut.changeMemberRole(targetGroupId.toString(), successorId.toString(), RoleCode.ROLE_STAMP_ISSUER)

        // THEN
        Assertions.assertNotNull(result)
        verify(this.groupLogic).changeMemberRole(group, successorId, RoleCode.ROLE_STAMP_ISSUER)
    }

    @Test
    @DisplayName("[正常系]グループが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenGroupNotFoundForChangeMemberRole() {
        // GIVEN
        val successorId = 1L
        val targetGroupId = 2L

        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(null)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.changeMemberRole(targetGroupId.toString(), successorId.toString(), RoleCode.ROLE_STAMP_ISSUER)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("グループが見つかりません", exception.message)
    }

    // ========================================
    // 観点: メンバーのロール変更 - changeMemberRole()
    // ========================================
    @Test
    @DisplayName("[正常系]グループが存在する場合、Logicが呼び出され戻り値が返却されること")
    fun shouldReturnSavedGroupAndCallLogicStamp() {
        // GIVEN
        val memberId = 1L
        val targetGroupId = 2L
        val targetName = "testGroup"
        val targetScheduledStartAt = FIXED_INSTANT
        val targetSlackChannelUrl = "http://slack.com"
        val targetStampsToReward = 10

        val group = Group(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = targetSlackChannelUrl,
            stampsToReward = targetStampsToReward
        )
        val stamp = Stamp(
            "http://example.com/stamp.png"
        )
        val groupStampAssignment = GroupStampAssignment(group, stamp)
        group.addGroupStampAssignment(groupStampAssignment)

        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger()
        ).apply { this.id = memberId }
        val membership = Membership(
            user = user,
            group = group
        )
        group.addMembership(membership)
        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(group)

        // GIVEN
        val result = sut.stamp(targetGroupId.toString(), memberId)

        // THEN
        Assertions.assertNotNull(result)
        verify(this.cardLogic).stamp(membership, listOf(stamp), targetStampsToReward)
    }

    @Test
    @DisplayName("[正常系]グループが存在しない場合、BusinessExceptionがスローされること")
    fun shouldThrowBusinessExceptionWhenGroupNotFoundForStamp() {
        // GIVEN
        val memberId = 1L
        val targetGroupId = 2L

        whenever(this.groupLogic.findById(targetGroupId))
            .thenReturn(null)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.stamp(targetGroupId.toString(), memberId)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("グループが見つかりません", exception.message)
    }
}