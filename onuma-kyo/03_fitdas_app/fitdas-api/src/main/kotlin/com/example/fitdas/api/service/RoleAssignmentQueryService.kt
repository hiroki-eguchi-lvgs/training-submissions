package com.example.fitdas.api.service

import com.example.fitdas.api.codegen.types.RoleCode
import com.example.fitdas.api.infrastructure.RoleAssignmentRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

interface RoleAssignmentQueryService {
    fun findAllByMembershipIds(membershipIds: Set<Long>): Map<Long, List<RoleCode>>
}

/*
* NOTE: READの責務のみを持つService、Logicを挟むと冗長になるため直接Repositoryに依存する
*/
@Service
@Transactional(readOnly = true)
class RoleAssignmentQueryServiceImpl(private val repository: RoleAssignmentRepository) : RoleAssignmentQueryService {
    override fun findAllByMembershipIds(membershipIds: Set<Long>): Map<Long, List<RoleCode>> {
        val membershipIdToRoleCode = repository.findAllWithRolesByMembershipIds(membershipIds).groupBy(
            keySelector = { it.membership.id!! },
            valueTransform = { RoleCode.valueOf(it.getRoleCode().name) }
        )
        // 紐づくロールがなかったmembershipIdに対して空Listを紐づけ
        return membershipIds.associateWith { membershipIdToRoleCode[it] ?: emptyList() }
    }
}