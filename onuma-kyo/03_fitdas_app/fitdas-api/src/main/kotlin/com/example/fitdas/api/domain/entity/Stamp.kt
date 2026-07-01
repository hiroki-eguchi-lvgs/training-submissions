package com.example.fitdas.api.domain.entity

import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant

@Entity
@Table(name = "stamps")
@EntityListeners(
    AuditingEntityListener::class
)
class Stamp(
    var imagePath: String = "",
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

    @OneToMany(mappedBy = "stamp", cascade = [CascadeType.ALL], orphanRemoval = true)
    private val groupStampAssignments: MutableList<GroupStampAssignment> = ArrayList()

    fun addGroupStampAssignment(groupStampAssignment: GroupStampAssignment) {
        groupStampAssignments.add(groupStampAssignment)
    }

    fun removeGroupStampAssignment(groupStampAssignment: GroupStampAssignment) {
        groupStampAssignments.remove(groupStampAssignment)
    }

    @OneToMany(mappedBy = "stamp", cascade = [CascadeType.ALL], orphanRemoval = true)
    val stampHistories: MutableList<StampHistory> = ArrayList()

    fun addStampHistory(stampHistory: StampHistory) {
        stampHistories.add(stampHistory)
    }
}