package com.example.fitdas.api.domain

import com.example.fitdas.api.codegen.types.Membership
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant


@Entity
@Table(name = "memberships")
@EntityListeners(
    AuditingEntityListener::class
)
class Membership(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    val group: Group
) {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    var id: Long? = null

    @Column(updatable = false)
    @CreatedDate
    var createdAt: Instant? = null

    @LastModifiedDate
    var updatedAt: Instant? = null

    @Version
    var version: Int? = null

    @OneToMany(mappedBy = "membership", cascade = [CascadeType.ALL], orphanRemoval = true)
    val cards: MutableList<Card> = ArrayList()

    fun addCard(card: Card) {
        cards.add(card)
    }

    @OneToMany(mappedBy = "membership", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val roleAssignments: MutableList<RoleAssignment> = ArrayList()

    fun addRoleAssignment(roleAssignment: RoleAssignment) {
        roleAssignments.add(roleAssignment)
    }

    fun removeRoleAssignment(roleAssignment: RoleAssignment) {
        roleAssignments.remove(roleAssignment)
    }

    fun hasUser(id: Long): Boolean {
        return user.id == id
    }

    fun hasRoleAssignments(): Boolean = roleAssignments.isNotEmpty()

    fun findRoleAssignment(code: RoleCode): RoleAssignment? {
        return roleAssignments.firstOrNull { it.hasRole(code) }
    }

    fun toGraphQLMembership(): Membership {
        return Membership(
            id = this.id.toString(),
            userId = this.user.id.toString(),
            roles = emptyList()
        )
    }

    fun getCurrentCard(): Card {
        return cards.sortedByDescending { it.generation }.first()
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is com.example.fitdas.api.domain.Membership) return false

        if (user != other.user) return false
        if (group != other.group) return false

        return true
    }

    override fun hashCode(): Int {
        var result = user.hashCode()
        result = 31 * result + group.hashCode()
        return result
    }
}