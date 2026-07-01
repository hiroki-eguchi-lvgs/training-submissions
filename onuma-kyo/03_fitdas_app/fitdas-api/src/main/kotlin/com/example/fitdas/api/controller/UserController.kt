package com.example.fitdas.api.controller

import com.example.fitdas.api.codegen.types.User
import com.example.fitdas.api.codegen.types.UserUpdatePayload
import com.example.fitdas.api.infrastructure.CustomOidcUser
import com.example.fitdas.api.service.UserService
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder

@DgsComponent
class UserController(private val userService: UserService) {

    @DgsMutation
    fun userUpdate(@InputArgument migratingStamps: Int): UserUpdatePayload {
        if (SecurityContextHolder.getContext().authentication?.principal !is CustomOidcUser) {
            throw AuthenticationCredentialsNotFoundException("ログインされていません。")
        }
        val user: CustomOidcUser = SecurityContextHolder.getContext().authentication?.principal as CustomOidcUser
        return userService.updateUser(user.userId, migratingStamps).let {
            UserUpdatePayload(
                user = User(
                    id = it.id!!.toString(),
                    name = it.name,
                )
            )
        }
    }
}