package com.example.fitdas.api.infrastructure

import com.example.fitdas.api.domain.RoleAssignment
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface RoleAssignmentRepository : JpaRepository<RoleAssignment, Long> {
    @EntityGraph(attributePaths = ["role"])
    @Query(
        """
        SELECT r FROM RoleAssignment r
        WHERE r.membership.id IN :membershipIds
    """
    )
    fun findAllWithRolesByMembershipIds(membershipIds: Set<Long>): List<RoleAssignment>
}