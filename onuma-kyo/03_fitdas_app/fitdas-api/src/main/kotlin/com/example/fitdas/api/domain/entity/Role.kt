package com.example.fitdas.api.domain.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant

enum class RoleCode {
    ROLE_ADMIN,
    ROLE_STAMP_ISSUER,
    ROLE_REWARD_MANAGER
}

@Entity
@Table(name = "roles")
@EntityListeners(
    AuditingEntityListener::class
)
class Role(
    var name: String,
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false, updatable = false)
    val code: RoleCode,
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

    @OneToMany(mappedBy = "role", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val roleAssignments: MutableList<RoleAssignment> = ArrayList()

    fun addRoleAssignment(roleAssignment: RoleAssignment) {
        roleAssignments.add(roleAssignment)
    }

    fun removeRoleAssignment(roleAssignment: RoleAssignment) {
        roleAssignments.remove(roleAssignment)
    }

    fun isCode(code: RoleCode): Boolean {
        return code == this.code
    }
}