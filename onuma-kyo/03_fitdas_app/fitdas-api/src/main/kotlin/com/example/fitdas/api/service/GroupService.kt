package com.example.fitdas.api.service

import com.example.fitdas.api.codegen.types.GroupInput
import com.example.fitdas.api.domain.entity.Group
import com.example.fitdas.api.domain.entity.MigratingStatus
import com.example.fitdas.api.domain.entity.RoleCode
import com.example.fitdas.api.domain.logic.CardLogic
import com.example.fitdas.api.domain.logic.GroupLogic
import com.example.fitdas.api.exception.BusinessException
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

interface GroupService {
    fun group(id: String): Group
    fun groupWithMemberships(id: String): Group
    fun findAllByUserId(userId: Long): List<Group>
    fun createGroup(stampIssuerId: Long, input: GroupInput): Group
    fun updateGroup(id: String, input: GroupInput): Group
    fun addMember(id: String, memberId: Long): Group
    fun changeMemberRole(id: String, successorId: String, roleCode: RoleCode): Group
    fun stamp(id: String, memberId: Long): Group
}

@Service
@Transactional
class GroupServiceImpl(
    private val groupLogic: GroupLogic,
    private val cardLogic: CardLogic,
    private val eventPublisher: ApplicationEventPublisher
) : GroupService {
    private val logger: Logger = LoggerFactory.getLogger(this.javaClass)

    override fun group(id: String): Group {
        return groupLogic.findById(id.toLong()) ?: throw BusinessException("グループが見つかりません")
    }

    override fun groupWithMemberships(id: String): Group {
        return groupLogic.findByIdWithMemberships(id.toLong()) ?: throw BusinessException("グループが見つかりません")
    }

    override fun findAllByUserId(userId: Long): List<Group> {
        return groupLogic.findAllByUserId(userId)
    }

    override fun createGroup(stampIssuerId: Long, input: GroupInput): Group {
        if (!groupLogic.validate(input)) {
            throw BusinessException("入力値が不正です")
        }
        val savedGroupWrapper = groupLogic.createGroup(stampIssuerId, input)
        val savedGroup = savedGroupWrapper.group
        val membership =
            savedGroup.findMembershipByUserId(stampIssuerId)
        val event = savedGroupWrapper.event
        cardLogic.createCard(membership, event, savedGroup.getAssignedStamps())
        if (event.status === MigratingStatus.MIGRATING) {
            eventPublisher.publishEvent(event.toMigrated())
        }
        return savedGroup
    }

    override fun updateGroup(id: String, input: GroupInput): Group {
        if (!groupLogic.validate(input)) {
            throw BusinessException("入力値が不正です")
        }
        val groupSaved = groupLogic.findById(id.toLong()) ?: throw BusinessException("グループが見つかりません")
        return groupLogic.updateGroup(groupSaved, input)
    }

    override fun addMember(id: String, memberId: Long): Group {
        val group = groupLogic.findById(id.toLong()) ?: throw BusinessException("グループが見つかりません")
        val savedGroupWrapper = groupLogic.addMember(group, memberId)
        val savedGroup = savedGroupWrapper.group
        val membership =
            savedGroup.findMembershipByUserId(memberId)
        val event = savedGroupWrapper.event
        cardLogic.createCard(membership, event, savedGroup.getAssignedStamps())
        if (event.status === MigratingStatus.MIGRATING) {
            eventPublisher.publishEvent(event.toMigrated())
        }
        return savedGroup
    }

    override fun changeMemberRole(id: String, successorId: String, roleCode: RoleCode): Group {
        val groupSaved = groupLogic.findById(id.toLong()) ?: throw BusinessException("グループが見つかりません")
        return groupLogic.changeMemberRole(groupSaved, successorId.toLong(), roleCode)
    }

    override fun stamp(id: String, memberId: Long): Group {
        val group = groupLogic.findById(id.toLong()) ?: throw BusinessException("グループが見つかりません")
        cardLogic.stamp(
            group.findMembershipByUserId(memberId), group.getAssignedStamps(), group.stampsToReward
        )
        return group
    }
}