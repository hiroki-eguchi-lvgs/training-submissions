package com.example.fitdas.api.logic

import com.example.fitdas.api.codegen.types.GroupInput
import com.example.fitdas.api.domain.*
import com.example.fitdas.api.exception.BusinessException
import com.example.fitdas.api.infrastructure.GroupRepository
import com.example.fitdas.api.infrastructure.RoleRepository
import com.example.fitdas.api.infrastructure.StampRepository
import com.example.fitdas.api.infrastructure.UserRepository
import org.springframework.stereotype.Component
import kotlin.jvm.optionals.getOrNull


@Component
class GroupLogic(
    private val groupRepository: GroupRepository,
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val stampRepository: StampRepository
) {
    companion object {
        private val MAX_STRING_LENGTH = 255
        private val MAX_STAMPS_NUM = 30
    }

    fun findAllByUserId(userId: Long): List<Group> = groupRepository.findAllByUserId(userId)
    fun findById(id: Long): Group? {
        return groupRepository.findById(id).getOrNull()
    }

    fun findByIdWithMemberships(id: Long): Group? {
        return groupRepository.findByIdWithMemberships(id)
    }

    fun validate(input: GroupInput): Boolean {
        if (input.name.isBlank() || input.name.length > MAX_STRING_LENGTH) {
            return false
        }
        if (input.stampsToReward > MAX_STAMPS_NUM) {
            return false
        }
        return true
    }


    fun createGroup(stampIssuerId: Long, input: GroupInput): GroupWrapper {
        // Group作成
        val group = Group(
            name = input.name,
            scheduledStartAt = input.scheduledStartAt,
            slackChannelUrl = input.slackChannelUrl.toString(),
            stampsToReward = input.stampsToReward,
        )
        // NOTE: 予期せぬFlushを避けるため冒頭でまとめてREAD
        // READ時にHibernateの自動フラッシュ（Auto-Flush）が走る
        val stampIssuerRole = roleRepository.findByCode(RoleCode.ROLE_STAMP_ISSUER)
            ?: throw BusinessException("ロール:${RoleCode.ROLE_STAMP_ISSUER}のデータが登録されていません")
        val rewardManagerRole = roleRepository.findByCode(RoleCode.ROLE_REWARD_MANAGER)
            ?: throw BusinessException("ロール:${RoleCode.ROLE_STAMP_ISSUER}のデータが登録されていません")
        // FIXME: ↓スタンプ選択機能実装する際にstampのID一覧と対応するStampエンティティをREADするよう修正
        val assignedStamps =
            stampRepository.findAll().ifEmpty { throw BusinessException("スタンプが見つかりません。") }
        assignedStamps.forEach {
            group.addGroupStampAssignment(GroupStampAssignment(group, it))
        }
        val membershipWrapper = newMember(group, stampIssuerId)
        val membership = membershipWrapper.membership
        group.addMembership(membership)
        // membershipにスタンプ係、ご褒美係のRoleを割り当てる
        membership.addRoleAssignment(RoleAssignment(membership, stampIssuerRole))
        membership.addRoleAssignment(RoleAssignment(membership, rewardManagerRole))
        val savedGroup = groupRepository.save(group)
        return GroupWrapper(savedGroup, membershipWrapper.event)
    }

    fun updateGroup(group: Group, input: GroupInput): Group {
        // Group取得
        group.name = input.name
        group.scheduledStartAt = input.scheduledStartAt
        group.slackChannelUrl = input.slackChannelUrl.toString()
        group.stampsToReward = input.stampsToReward
        // stampを洗替え
        group.clearGroupStampAssignments()
        // stampのID一覧と対応するStampエンティティをREAD
        // 各StampエンティティとGroupの関連エンティティを作成
        stampRepository.findAllById(input.stampIds.map { it.toLong() }).forEach {
            GroupStampAssignment(group, it)
        }
        return groupRepository.save(group)
//        logger.info("Review added {}", review)
    }

    fun addMember(group: Group, memberId: Long): GroupWrapper {
        val membershipWrapper = newMember(group, memberId)
        if (group.hasMembership(membershipWrapper.membership)) {
            throw BusinessException("このグループに同じユーザーが登録済です")
        }
        group.addMembership(membershipWrapper.membership)
        val savedGroup = groupRepository.save(group)
        return GroupWrapper(savedGroup, membershipWrapper.event)
    }

    fun newMember(group: Group, memberId: Long): MembershipWrapper {
        val user =
            userRepository.findById(memberId).orElseThrow({ throw BusinessException("ユーザーが見つかりません") })
        val event = user.toStampMigratedEvent()
        val membership = Membership(user, group)
        return MembershipWrapper(membership, event)
    }

    fun changeMemberRole(group: Group, successorId: Long, roleCode: RoleCode): Group {
        // 引数のuserIdと紐づく、Membershipを取得
        val successorMembership = group.findMembershipById(successorId)
        // 引数のRoleCode(またはID)と紐づくRoleを取得
        // Roleと紐づくRoleAssignmentを取得
        val roleAssignment = group.findRoleAssignment(code = roleCode)
        if (roleAssignment.membership.id == successorMembership.id) {
            throw BusinessException("このメンバーにはすでに同じロールが割り当てられています")
        }
        // RoleAssignmentの紐づけ先、Membershipを上書き
        roleAssignment.membership = successorMembership
        return groupRepository.save(group)
    }
}