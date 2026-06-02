package com.example.fitdas.api.exception


import graphql.GraphQLError
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.web.bind.annotation.ControllerAdvice

@ControllerAdvice
class GraphQlExceptionHandler {
    private val logger: Logger = LoggerFactory.getLogger(this.javaClass)

    @GraphQlExceptionHandler
    fun handle(ex: Exception): GraphQLError {
        logger.error(ex.message, ex)
        when (ex) {
            is BusinessException -> {
                return GraphQLError.newError()
                    .message(ex.message)
                    .extensions(mapOf("classification" to ex.javaClass.simpleName))
                    .build()
            }

            is AuthenticationCredentialsNotFoundException -> {
                return GraphQLError.newError()
                    .message(ex.message)
                    .extensions(mapOf("classification" to ex.javaClass.simpleName))
                    .build()
            }

            is IllegalStateException -> {
                return GraphQLError.newError()
                    .message("サーバーエラーが発生しました。")
                    .extensions(mapOf("classification" to ex.javaClass.simpleName))
                    .build()
            }

            else -> {
                return GraphQLError.newError()
                    .message("予期せぬエラーが発生しました。")
                    .extensions(mapOf("classification" to ex.javaClass.simpleName))
                    .build()
            }
        }


    }
}