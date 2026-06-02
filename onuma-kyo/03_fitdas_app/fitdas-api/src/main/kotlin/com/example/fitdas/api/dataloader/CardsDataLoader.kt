package com.example.fitdas.api.dataloader

import com.example.fitdas.api.codegen.types.Card
import com.example.fitdas.api.service.CardService
import com.netflix.graphql.dgs.DgsDataLoader
import org.dataloader.MappedBatchLoader
import java.util.concurrent.CompletableFuture
import java.util.concurrent.CompletionStage

@DgsDataLoader(name = "cards")
class CardsDataLoader(
    private val service: CardService,
) : MappedBatchLoader<Long, Card> {

    override fun load(membershipIds: Set<Long>): CompletionStage<Map<Long, Card>> {
        return CompletableFuture.supplyAsync {
            val cards = service.findMaxGenerationCardsByMemberships(membershipIds)

            return@supplyAsync cards
        }
    }
}