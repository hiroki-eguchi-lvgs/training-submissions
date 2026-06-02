package com.example.fitdas.api.config

import com.example.fitdas.api.infrastructure.FederatedIdentityAuthenticationSuccessHandler
import com.example.fitdas.api.service.CustomOidcUserService
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    @Value("\${CLIENT_BASE_URL:http://localhost:5173}")
    private val clientBaseUrl: String
) {


    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()

        configuration.allowedOrigins = listOf(clientBaseUrl)
        configuration.allowedMethods = listOf("GET", "POST", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)

        return source
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity, customOidcUserService: CustomOidcUserService): SecurityFilterChain {
        http {
            cors { configurationSource = corsConfigurationSource() }
            csrf { disable() }
            authorizeHttpRequests {
                authorize("/login", permitAll)
                // TODO: ↓Postmanでテストするように許可している、本番では要削除
//                authorize("/graphql", permitAll)
                authorize(anyRequest, authenticated) // それ以外は要認証
            }
            oauth2Login {
                authenticationSuccessHandler = FederatedIdentityAuthenticationSuccessHandler(clientBaseUrl)
                userInfoEndpoint {
                    // 認証プロバイダにGoogleを利用、
                    // 認証完了後に{@link CustomOidcUserService}がUserInfoエンドポイントから情報取得&DB保存
                    oidcUserService = customOidcUserService
                }
            }
        }
        return http.build()
    }
}