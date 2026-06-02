package com.example.fitdas.api.dataloader

import com.example.fitdas.api.codegen.types.User
import com.example.fitdas.api.service.UserService
import com.netflix.graphql.dgs.DgsDataLoader
import org.dataloader.MappedBatchLoader
import java.util.concurrent.CompletableFuture
import java.util.concurrent.CompletionStage

@DgsDataLoader(name = "users")
class UserDataLoader(
    private val userService: UserService,
) : MappedBatchLoader<Long, User> {

    override fun load(ids: Set<Long>): CompletionStage<Map<Long, User>> {
        return CompletableFuture.supplyAsync {
            val users = userService.findAllByIds(ids)
            return@supplyAsync users
        }
    }
}