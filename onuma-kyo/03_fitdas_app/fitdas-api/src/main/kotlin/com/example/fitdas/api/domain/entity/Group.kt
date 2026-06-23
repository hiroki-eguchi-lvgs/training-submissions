package com.example.fitdas.api.domain.entity

import com.example.fitdas.api.exception.BusinessException
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.time.LocalTime


@Entity
@Table(name = "groups")
@EntityListeners(
    AuditingEntityListener::class
)
class Group(
    var name: String,
    var scheduledStartAt: LocalTime,
    var slackChannelUrl: String,
    var stampsToReward: Int,
) {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    var id: Long? = null

    @CreatedDate
    @Column(nullable = false, updatable = false)
    var createdAt: Instant? = null

    @LastModifiedDate
    @Column(nullable = false)
    var updatedAt: Instant? = null

    @Version
    var version: Int? = null

    @OneToMany(mappedBy = "group", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val memberships: MutableSet<Membership> = mutableSetOf()

    @OneToMany(mappedBy = "group", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val groupStampAssignments: MutableList<GroupStampAssignment> = ArrayList()

    fun hasMembership(membership: Membership): Boolean = memberships.contains(membership)

    fun addMembership(membership: Membership) {
        memberships.add(membership)
    }

    fun findMembershipById(id: Long): Membership {
        return memberships.firstOrNull() { it.id == id }
            ?: throw BusinessException("指定されたIDのメンバーが存在しません")
    }

    fun findMembershipByUserId(userId: Long): Membership {
        return memberships.firstOrNull() { it.hasUser(userId) }
            ?: throw BusinessException("指定されたユーザーIDのメンバーが存在しません")
    }

    fun findRoleAssignment(code: RoleCode): RoleAssignment {
        // Note:「リストの中から、最初の null ではない結果を返す」という処理は、firstNotNullOfOrNullで一発で書ける
        // code＝RoleCodeのRoleAssignmentを含むroleAssignmentsに持つmembershipを探す
        return memberships.firstNotNullOfOrNull { it.findRoleAssignment(code) }
            ?: throw BusinessException("ロール:${code}のメンバーが存在しません")
    }

    fun removeMembership(membership: Membership) {
        memberships.remove(membership)
    }

    fun addGroupStampAssignment(groupStampAssignment: GroupStampAssignment) {
        groupStampAssignments.add(groupStampAssignment)
    }

    fun removeGroupStampAssignment(groupStampAssignment: GroupStampAssignment) {
        groupStampAssignments.remove(groupStampAssignment)
    }

    fun clearGroupStampAssignments() {
        groupStampAssignments.clear()
    }

    fun toGraphQLMemberships(): List<com.example.fitdas.api.codegen.types.Membership> {
        return memberships.map {
            it.toGraphQLMembership()
        }
    }

    fun getAssignedStamps(): List<Stamp> = this.groupStampAssignments.map { it.stamp }
}