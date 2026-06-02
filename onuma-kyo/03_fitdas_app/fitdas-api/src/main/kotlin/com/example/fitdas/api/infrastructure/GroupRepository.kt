package com.example.fitdas.api.infrastructure

import com.example.fitdas.api.domain.Group
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface GroupRepository : JpaRepository<Group, Long> {

    @EntityGraph(attributePaths = ["memberships"])
    @Query("SELECT g FROM Group g WHERE g.id = :id")
    fun findByIdWithMemberships(id: Long): Group?

    @Query(
        """
        SELECT g FROM Group g 
        WHERE g.id IN (
            SELECT m.group.id FROM Membership m 
            WHERE m.user.id = :userId
        )
    """
    )
    fun findAllByUserId(userId: Long): List<Group>
}