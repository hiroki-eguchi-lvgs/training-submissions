package com.example.fitdas.api.domain.entity

import com.example.fitdas.api.codegen.types.User
import com.example.fitdas.api.domain.event.UserStampMigratedEvent
import com.example.fitdas.api.exception.BusinessException
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.math.BigInteger
import java.time.Instant

enum class MigratingStatus {
    PENDING,
    MIGRATING,
    MIGRATED,
}

@Entity
@Table(name = "users") // NOTE: userはDBの予約語のためエラーになる
@EntityListeners(
    AuditingEntityListener::class
)
class User(
    val name: String,
    val googleSubId: BigInteger,
    @Enumerated(EnumType.STRING)
    var migratingStatus: MigratingStatus = MigratingStatus.PENDING,
    var migratingStamps: Int? = null
) {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    var id: Long? = null
        internal set // 同一モジュール内（テスト含む）からのみ変更可能にする

    @CreatedDate
    @Column(nullable = false, updatable = false)
    var createdAt: Instant? = null // NOTE: Null許容型にして完全にJPAに設定を任せる

    @LastModifiedDate
    @Column(nullable = false)
    var updatedAt: Instant? = null

    @Version
    var version: Int? = null

    @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val memberships: MutableList<Membership> = mutableListOf()

    fun addMembership(membership: Membership) {
        memberships.add(membership)
    }

    fun removeMembership(membership: Membership) {
        memberships.remove(membership)
    }

    fun toGraphQLUser(): User {
        return User(
            id = this.id.toString(),
            name = this.name,
        )
    }

    fun toStampMigratedEvent(): UserStampMigratedEvent {
        val migratingStamps: Int =
            this.migratingStamps ?: throw BusinessException("ユーザー登録処理途中のため続行できません。")
        return UserStampMigratedEvent(this.id!!, this.migratingStatus, migratingStamps)
    }
}