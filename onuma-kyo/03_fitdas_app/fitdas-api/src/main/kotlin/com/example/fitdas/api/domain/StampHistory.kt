package com.example.fitdas.api.domain

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant

@Entity
@Table(name = "stamp_histories")
@EntityListeners(
    AuditingEntityListener::class
)
class StampHistory(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    var card: Card,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stamp_id", nullable = false)
    val stamp: Stamp
) {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    var id: Long? = null

    @Column(updatable = false)
    @CreatedDate
    var createdAt: Instant? = null
}