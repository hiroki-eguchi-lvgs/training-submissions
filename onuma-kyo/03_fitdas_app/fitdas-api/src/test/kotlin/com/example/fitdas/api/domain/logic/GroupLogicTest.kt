package com.example.fitdas.api.domain.logic

import com.example.fitdas.api.codegen.types.GroupInput
import com.example.fitdas.api.domain.entity.*
import com.example.fitdas.api.exception.BusinessException
import com.example.fitdas.api.infrastructure.GroupRepository
import com.example.fitdas.api.infrastructure.RoleRepository
import com.example.fitdas.api.infrastructure.StampRepository
import com.example.fitdas.api.infrastructure.UserRepository
import org.junit.jupiter.api.*
import org.mockito.kotlin.*
import org.springframework.test.util.ReflectionTestUtils
import java.net.URI
import java.time.LocalTime
import java.util.*

class GroupLogicTest {

    companion object {
        private val MAX_STRING_LENGTH = ReflectionTestUtils.getField(
            GroupLogic::class.java,
            "MAX_STRING_LENGTH"
        ) as Int
        private val MAX_STAMPS_NUM = ReflectionTestUtils.getField(
            GroupLogic::class.java,
            "MAX_STAMPS_NUM"
        ) as Int
        private val FIXED_INSTANT: LocalTime = LocalTime.of(12, 0)
    }

    private lateinit var sut: GroupLogic
    private lateinit var groupRepository: GroupRepository
    private lateinit var userRepository: UserRepository
    private lateinit var roleRepository: RoleRepository
    private lateinit var stampRepository: StampRepository

    @BeforeEach
    fun setUp() {
        this.groupRepository = mock()
        this.userRepository = mock()
        this.roleRepository = mock()
        this.stampRepository = mock()
        this.sut = GroupLogic(groupRepository, userRepository, roleRepository, stampRepository)
    }

    // ========================================
    // 観点: バリデーションチェック - validate()
    // ========================================
    @Test
    @DisplayName("[正常系] GroupInputのnameが空でなく、MAX_STRING_LENGTH以下、stampsToRewardがMAX_STAMPS_NUM以下の場合、trueを返す")
    fun shouldReturnTrueWhenInputIsValid() {
        // GIVEN
        val groupInput = GroupInput(
            name = "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789001234567890123456789012345678901234",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 30,
            stampIds = emptyList()
        )

        // WHEN&THEN
        Assertions.assertTrue(this.sut.validate(groupInput))
    }

    @Test
    @DisplayName("[正常系] GroupInputのnameが空の場合、falseを返す")
    fun shouldReturnFalseWhenNameIsEmpty() {
        // GIVEN
        val groupInput = GroupInput(
            name = "",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 10,
            stampIds = emptyList()
        )

        // WHEN&THEN
        Assertions.assertFalse(this.sut.validate(groupInput))
    }

    @Test
    @DisplayName("[正常系] GroupInputのnameの文字数が256の場合、falseを返す")
    fun shouldReturnFalseWhenNameExceedsMaxLength() {
        // GIVEN
        val groupInput = GroupInput(
            name = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890012345678901234567890123456789012345",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 10,
            stampIds = emptyList()
        )

        // WHEN&THEN
        Assertions.assertFalse(this.sut.validate(groupInput))
    }

    @Test
    @DisplayName("[正常系] GroupInputのmigratingStampsが31の場合、falseを返す")
    fun shouldReturnFalseWhenMigratingStampsExceedsMaxLength() {
        // GIVEN
        val groupInput = GroupInput(
            name = "123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789001234567890123456789012345678901234",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 31,
            stampIds = emptyList()
        )

        // WHEN&THEN
        Assertions.assertFalse(this.sut.validate(groupInput))
    }

    // ========================================
    // 観点: 新規作成 - createGroup()
    // ========================================
    @Test
    @DisplayName("[正常系] GroupInputを元にGroupを新規作成し、Groupにスタンプ、Membership、Roleが紐付いていること")
    fun shouldCreateGroupWithStampsMembershipsAndRoles() {
        // GIVEN
        val targetStampIssuerId = 1L
        val targetGroupId = 2L
        val groupInput = GroupInput(
            name = "testGroup",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 10,
            stampIds = emptyList()
        )
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.MIGRATING,
            migratingStamps = 1
        ).apply { this.id = targetStampIssuerId }
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val rewardManagerRole = Role(
            code = RoleCode.ROLE_REWARD_MANAGER,
            name = "ご褒美係"
        )
        val stamps = listOf(
            Stamp("http://example.com/stamp1.png"),
            Stamp("http://example.com/stamp2.png"),
            Stamp("http://example.com/stamp3.png"),
            Stamp("http://example.com/stamp4.png"),
            Stamp("http://example.com/stamp5.png"),
        )

        whenever(roleRepository.findByCode(RoleCode.ROLE_STAMP_ISSUER))
            .thenReturn(stampIssuerRole)
        whenever(roleRepository.findByCode(RoleCode.ROLE_REWARD_MANAGER))
            .thenReturn(rewardManagerRole)
        whenever(stampRepository.findAll())
            .thenReturn(stamps)
        whenever(userRepository.findById(targetStampIssuerId))
            .thenReturn(Optional.of(user))
        whenever(groupRepository.save(any<Group>()))
            .thenAnswer { it.getArgument<Group>(0).apply { this.id = targetGroupId } }

        // WHEN
        val result = sut.createGroup(targetStampIssuerId, groupInput)
        val actualGroup = result.group
        val actualMembership = actualGroup.findMembershipByUserId(targetStampIssuerId)
        val acutalStamps = actualGroup.getAssignedStamps()

        // THEN
        // groupにGroupStampAssignmentが紐付けられている
        Assertions.assertEquals(stamps, acutalStamps)
        // groupにMembershipが紐付けられている
        Assertions.assertNotNull(actualMembership)
        // MembershipにRoleAssignmentが紐付けられている
        Assertions.assertEquals(
            RoleCode.ROLE_STAMP_ISSUER,
            actualMembership.findRoleAssignment(RoleCode.ROLE_STAMP_ISSUER)?.getRoleCode()
        )
        Assertions.assertEquals(
            RoleCode.ROLE_REWARD_MANAGER,
            actualMembership.findRoleAssignment(RoleCode.ROLE_REWARD_MANAGER)?.getRoleCode()
        )
    }

    @Test
    @DisplayName("[異常系] ROLE_REWARD_MANAGERのRoleが存在しない場合、BusinessExceptionをスローする")
    fun shouldThrowBusinessExceptionWhenRewardManagerRoleDoesNotExist() {
        // GIVEN
        val targetStampIssuerId = 1L
        val groupInput = GroupInput(
            name = "testGroup",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 10,
            stampIds = emptyList()
        )
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        whenever(roleRepository.findByCode(RoleCode.ROLE_STAMP_ISSUER))
            .thenReturn(stampIssuerRole)
        whenever(roleRepository.findByCode(RoleCode.ROLE_REWARD_MANAGER))
            .thenReturn(null)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.createGroup(targetStampIssuerId, groupInput)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("ロール:ROLE_REWARD_MANAGERのデータが登録されていません", exception.message)
    }

    @Test
    @DisplayName("[異常系] ROLE_STAMP_ISSUERのRoleが存在しない場合、BusinessExceptionをスローする")
    fun shouldThrowBusinessExceptionWhenStampIssuerRoleDoesNotExist() {
        // GIVEN
        val targetStampIssuerId = 1L
        val groupInput = GroupInput(
            name = "testGroup",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 10,
            stampIds = emptyList()
        )

        whenever(roleRepository.findByCode(RoleCode.ROLE_STAMP_ISSUER))
            .thenReturn(null)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.createGroup(targetStampIssuerId, groupInput)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("ロール:ROLE_STAMP_ISSUERのデータが登録されていません", exception.message)
    }

    @Test
    @DisplayName("[異常系] DB登録済のStampが存在しない場合、BusinessExceptionをスローする")
    fun shouldThrowBusinessExceptionWhenRegisteredStampsDoNotExist() {
        // GIVEN
        val targetStampIssuerId = 1L
        val groupInput = GroupInput(
            name = "testGroup",
            scheduledStartAt = FIXED_INSTANT,
            slackChannelUrl = URI.create("http://slack.com").toURL(),
            stampsToReward = 10,
            stampIds = emptyList()
        )
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val rewardManagerRole = Role(
            code = RoleCode.ROLE_REWARD_MANAGER,
            name = "ご褒美係"
        )

        whenever(roleRepository.findByCode(RoleCode.ROLE_STAMP_ISSUER))
            .thenReturn(stampIssuerRole)
        whenever(roleRepository.findByCode(RoleCode.ROLE_REWARD_MANAGER))
            .thenReturn(rewardManagerRole)
        whenever(stampRepository.findAll())
            .thenReturn(emptyList<Stamp>())

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            this.sut.createGroup(targetStampIssuerId, groupInput)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("スタンプが見つかりません。", exception.message)
    }

    // ========================================
    // 観点: 新規作成 - updateGroup()
    // ========================================
    @Test
    @DisplayName("[正常系] GroupInputを元にGroupが更新されていること")
    fun shouldUpdateGroupByGroupInput() {
        // GIVEN
        val targetName = "更新されたグループ"
        val targetScheduledStartAt = LocalTime.of(2, 0, 0)
        val targetSlackChannelUrl = "http://slack-updated.com"
        val targetStampsToReward = 20
        val targetGroupId = 2L
        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        val orgGroup = Group(
            name = "新規グループ",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        ).apply {
            this.id = targetGroupId
        }
        val stamps = listOf(
            Stamp("http://example.com/stamp1.png"),
            Stamp("http://example.com/stamp2.png"),
            Stamp("http://example.com/stamp3.png"),
            Stamp("http://example.com/stamp4.png"),
            Stamp("http://example.com/stamp5.png"),
        )

        whenever(stampRepository.findAll())
            .thenReturn(stamps)
        whenever(groupRepository.save(any<Group>()))
            .thenAnswer { it.getArgument<Group>(0) }

        // WHEN
        sut.updateGroup(orgGroup, groupInput)

        // THEN
        argumentCaptor<Group>().apply {
            verify(groupRepository).save(capture())
            Assertions.assertEquals(targetName, firstValue.name)
            Assertions.assertEquals(targetScheduledStartAt, firstValue.scheduledStartAt)
            Assertions.assertEquals(targetSlackChannelUrl, firstValue.slackChannelUrl)
            Assertions.assertEquals(targetStampsToReward, firstValue.stampsToReward)
        }
    }

    @Test
    @DisplayName("[異常系] DB登録済のStampが存在しない場合、BusinessExceptionをスローする")
    fun shouldThrowBusinessExceptionWhenRegisteredStampsDoNotExistForUpdate() {
        // GIVEN
        val targetName = "更新されたグループ"
        val targetScheduledStartAt = LocalTime.of(2, 0, 0)
        val targetSlackChannelUrl = "http://slack-updated.com"
        val targetStampsToReward = 20
        val targetGroupId = 2L
        val groupInput = GroupInput(
            name = targetName,
            scheduledStartAt = targetScheduledStartAt,
            slackChannelUrl = URI.create(targetSlackChannelUrl).toURL(),
            stampsToReward = targetStampsToReward,
            stampIds = emptyList()
        )
        val orgGroup = Group(
            name = "新規グループ",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        ).apply {
            this.id = targetGroupId
        }
        whenever(stampRepository.findAll())
            .thenReturn(emptyList<Stamp>())

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            sut.updateGroup(orgGroup, groupInput)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("スタンプが見つかりません。", exception.message)
    }

    // ========================================
    // 観点: メンバー追加 - addMember()
    // ========================================
    @Test
    @DisplayName("[正常系] GroupにMembershipが追加されること")
    fun shouldAddNewMemberToGroup() {
        // GIVEN
        val targetMemberId = 1L
        val targetGroupId = 2L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        ).apply {
            this.id = targetGroupId
        }
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.MIGRATING,
            migratingStamps = 1
        ).apply { this.id = targetMemberId }

        whenever(userRepository.findById(targetMemberId))
            .thenReturn(Optional.of(user))
        whenever(groupRepository.save(any<Group>()))
            .thenAnswer { it.getArgument<Group>(0) }

        // WHEN
        val result = sut.addMember(group, targetMemberId)

        // THEN
        // groupにMembershipが紐付けられている
        Assertions.assertNotNull(result.group.findMembershipByUserId(targetMemberId))
    }

    @Test
    @DisplayName("[正常系] 指定されたId:のユーザーが既にグループに存在する場合、BusinessExceptionをスロー")
    fun shouldThrowBusinessExceptionWhenMemberAlreadyExist() {
        // GIVEN
        val targetMemberId = 1L
        val targetGroupId = 2L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        ).apply {
            this.id = targetGroupId
        }
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.MIGRATING,
            migratingStamps = 1
        ).apply { this.id = targetMemberId }
        group.addMembership(Membership(user, group))

        whenever(userRepository.findById(targetMemberId))
            .thenReturn(Optional.of(user))

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            sut.addMember(group, targetMemberId)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("このグループに同じユーザーが登録済です", exception.message)
    }

    // ========================================
    // 観点: メンバー新規作成 - newMember()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定のグループとuserIdのユーザーを紐づけるMembershipとユーザーのスタンプ移行に関するイベントが返却されること")
    fun shouldReturnMembershipAndStampMigratedEvent() {
        // GIVEN
        val targetMemberId = 1L
        val targetGroupId = 2L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        ).apply {
            this.id = targetGroupId
        }
        val user = User(
            name = "testUser",
            googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
            migratingStatus = MigratingStatus.MIGRATING,
            migratingStamps = 1
        ).apply { this.id = targetMemberId }

        whenever(userRepository.findById(targetMemberId))
            .thenReturn(Optional.of(user))

        // WHEN
        val result = sut.newMember(group, targetMemberId)

        // THEN
        Assertions.assertEquals(Membership(user, group), result.membership)
        Assertions.assertEquals(user.toStampMigratedEvent(), result.event)
    }

    @Test
    @DisplayName("[異常系] 指定のuserIdのユーザーが存在しない場合、BusinessExceptionをスロー")
    fun shouldThrowBusinessExceptionWhenUserNotExist() {
        // GIVEN
        val targetMemberId = 1L
        val targetGroupId = 2L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        ).apply {
            this.id = targetGroupId
        }
        whenever(userRepository.findById(targetMemberId))
            .thenReturn(Optional.empty())

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            sut.newMember(group, targetMemberId)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("ユーザーが見つかりません", exception.message)
    }

    // ========================================
    // 観点: メンバーのロール変更 - changeMemberRole()
    // ========================================
    @Test
    @DisplayName("[正常系] 指定されたroleCodeが紐づけ先が指定されたsuccessorIdのMembershipに変更される")
    fun shouldChangeRoleAssignment() {
        // GIVEN
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val orgRoleAssignedMembershipId = 0L
        val targetSuccessorMembershipId = 1L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val orgRoleAssignedMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply {
            this.id = orgRoleAssignedMembershipId
            this.addRoleAssignment(RoleAssignment(this, stampIssuerRole))
        }
        val targetSuccessorMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply { id = targetSuccessorMembershipId }
        group.addMembership(orgRoleAssignedMembership)
        group.addMembership(targetSuccessorMembership)

        whenever(groupRepository.save(any<Group>()))
            .thenAnswer { it.getArgument<Group>(0) }

        // WHEN
        sut.changeMemberRole(group, targetSuccessorMembershipId, RoleCode.ROLE_STAMP_ISSUER)

        // THEN
        argumentCaptor<Group>().apply {
            verify(groupRepository).save(capture())
            val actualRoleAssignedMembership = firstValue.findRoleAssignment(RoleCode.ROLE_STAMP_ISSUER).membership
            Assertions.assertEquals(targetSuccessorMembership, actualRoleAssignedMembership)
            Assertions.assertNotEquals(orgRoleAssignedMembership, actualRoleAssignedMembership)
        }
    }

    @Test
    @DisplayName("[正常系] 指定されたsuccessorIdのMembershipにすでに指定されたroleCodeが紐付けられている場合、BusinessExceptionをスロー")
    fun shouldThrowBusinessExceptionWhenRoleAlreadyAssigned() {
        // GIVEN
        val stampIssuerRole = Role(
            code = RoleCode.ROLE_STAMP_ISSUER,
            name = "スタンプ係"
        )
        val orgRoleAssignedMembershipId = 0L
        val group = Group(
            name = "test group",
            scheduledStartAt = LocalTime.of(1, 0, 0),
            slackChannelUrl = "http://slack.com",
            stampsToReward = 10,
        )
        val orgRoleAssignedMembership = Membership(
            User(
                name = "testUser",
                googleSubId = "12345678901234567890123456789012345678".toBigInteger(),
                migratingStatus = MigratingStatus.MIGRATING,
                migratingStamps = 1
            ),
            group
        ).apply {
            this.id = orgRoleAssignedMembershipId
            this.addRoleAssignment(RoleAssignment(this, stampIssuerRole))
        }
        group.addMembership(orgRoleAssignedMembership)

        // WHEN&THEN BusinessExceptionをスローする
        val exception = assertThrows<BusinessException> {
            sut.changeMemberRole(group, orgRoleAssignedMembershipId, RoleCode.ROLE_STAMP_ISSUER)
        }
        // THEN メッセージが正しいこと
        Assertions.assertNotNull(exception)
        Assertions.assertEquals("このメンバーにはすでに同じロールが割り当てられています", exception.message)
    }
}