package com.example.fitdas.api.dataloader

import com.example.fitdas.api.codegen.types.RoleCode
import com.example.fitdas.api.service.RoleAssignmentQueryService
import com.netflix.graphql.dgs.DgsDataLoader
import org.dataloader.MappedBatchLoader
import java.util.concurrent.CompletableFuture
import java.util.concurrent.CompletionStage

@DgsDataLoader(name = "roles")
class RoleDataLoader(
    private val service: RoleAssignmentQueryService,
) : MappedBatchLoader<Long, List<RoleCode>> {

    override fun load(membershipIds: Set<Long>): CompletionStage<Map<Long, List<RoleCode>>> {
        return CompletableFuture.supplyAsync {
            val roles = service.findAllByMembershipIds(membershipIds)
            return@supplyAsync roles
        }
    }
}