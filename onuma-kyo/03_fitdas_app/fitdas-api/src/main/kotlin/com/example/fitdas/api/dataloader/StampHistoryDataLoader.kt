package com.example.fitdas.api.dataloader

import com.example.fitdas.api.codegen.types.StampHistory
import com.example.fitdas.api.service.StampHistoryQueryService
import com.netflix.graphql.dgs.DgsDataLoader
import org.dataloader.MappedBatchLoader
import java.util.concurrent.CompletableFuture
import java.util.concurrent.CompletionStage

@DgsDataLoader(name = "stampHistories")
class StampHistoryDataLoader(
    private val service: StampHistoryQueryService,
) : MappedBatchLoader<Long, List<StampHistory>> {

    override fun load(cardIds: Set<Long>): CompletionStage<Map<Long, List<StampHistory>>> {
        return CompletableFuture.supplyAsync {
            val stampHistories = service.findAllByCardIds(cardIds)
            return@supplyAsync stampHistories
        }
    }
}