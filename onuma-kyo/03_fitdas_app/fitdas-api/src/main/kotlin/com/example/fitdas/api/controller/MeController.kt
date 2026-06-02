package com.example.fitdas.api.controller

import com.example.fitdas.api.codegen.types.Me
import com.example.fitdas.api.codegen.types.MigratingStatus
import com.example.fitdas.api.infrastructure.CustomOidcUser
import com.example.fitdas.api.service.UserService
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsQuery
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder

@DgsComponent
class MeController(private val userService: UserService) {

    @DgsQuery
    suspend fun me(): Me {
        if (SecurityContextHolder.getContext().authentication?.principal !is CustomOidcUser) {
            throw AuthenticationCredentialsNotFoundException("ログインされていません。")
        }
        val user: CustomOidcUser = SecurityContextHolder.getContext().authentication?.principal as CustomOidcUser
        return userService.user(user.userId).let {
            Me(
                userId = it!!.id.toString(),
                migratingStatus = MigratingStatus.valueOf(it.migratingStatus.name)
            )
        }
    }
}