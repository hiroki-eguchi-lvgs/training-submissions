package com.example.fitdas.api.service

import com.example.fitdas.api.domain.User
import com.example.fitdas.api.infrastructure.CustomOidcUser
import com.example.fitdas.api.infrastructure.UserRepository
import org.junit.jupiter.api.*
import org.mockito.kotlin.*
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.registration.ClientRegistration
import org.springframework.security.oauth2.core.OAuth2AccessToken
import org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import java.math.BigInteger
import java.time.Instant

class CustomOidcUserServiceTest {
    private lateinit var repository: UserRepository

    @BeforeEach
    fun setUp() {
        this.repository = mock()
    }

    @Test
    @DisplayName("ユーザが存在しない場合は保存され、そのidが設定されること")
    fun shouldSaveAndReturnUserWhenNotFound() {
        // GIVEN: リポジトリは該当ユーザを返さない（未登録）
        val sub = "123"
        val name = "Alice"
        val targetUserId = 99L

        whenever(repository.findByGoogleSubId(BigInteger(sub))).thenReturn(null)
        doAnswer {
            it.getArgument<User>(0).apply { this.id = targetUserId }
        }.whenever(repository).save(any<User>())

        // 属性sub,nameを持つダミーのOidcUserを用意する
        val oidcUser: OidcUser = DefaultOidcUser(
            AuthorityUtils.createAuthorityList("SCOPE_message:read"),
            OidcIdToken.withTokenValue("id-token").claim("name", name).claim("sub", sub).build(),
            "sub"
        )

        val clientRegistration = ClientRegistration.withRegistrationId("google")
            .clientId("id")
            .clientSecret("secret")
            .clientName("Google")
            .authorizationGrantType(org.springframework.security.oauth2.core.AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
            .scope("openid", "profile", "email")
            .authorizationUri("https://example.com/auth")
            .tokenUri("https://example.com/token")
            .jwkSetUri("https://example.com/jwk")
            .build()

        val idToken =
            OidcIdToken("id-token", Instant.now(), Instant.now().plusSeconds(3600), mapOf("sub" to sub, "name" to name))
        val accessToken = OAuth2AccessToken(TokenType.BEARER, "token", Instant.now(), Instant.now().plusSeconds(3600))
        val request = OidcUserRequest(clientRegistration, accessToken, idToken)

        // WHEN: モックした OidcUser を注入するためにサービスをサブクラス化（ネットワーク呼び出しを回避）
        val sut = object : CustomOidcUserService(repository) {
            override fun fetchOidcUser(userRequest: OidcUserRequest): OidcUser = oidcUser
        }
        val result = assertDoesNotThrow { sut.loadUser(request) }

        // THEN: CustomOidcUserが返り、saveのモックで設定したidが反映されている
        Assertions.assertTrue(result is CustomOidcUser)
        val custom = result as CustomOidcUser
        Assertions.assertEquals(targetUserId, custom.userId)
        verify(repository).save(any<User>())
    }

    @Test
    @DisplayName("ユーザが既に存在する場合は再保存されないこと")
    fun shouldNotSaveWhenUserExists() {
        // WHEN
        val sub = "456"
        val name = "Bob"
        val targetUserId = 5L
        val existingUser = User(name, BigInteger(sub)).apply { this.id = targetUserId }
        whenever(repository.findByGoogleSubId(BigInteger(sub))).thenReturn(existingUser)

        // 属性sub,nameを持つダミーのOidcUserを用意する
        val oidcUser: OidcUser = DefaultOidcUser(
            AuthorityUtils.createAuthorityList("SCOPE_message:read"),
            OidcIdToken.withTokenValue("id-token").claim("name", name).claim("sub", sub).build(),
            "sub"
        )

        val clientRegistration = ClientRegistration.withRegistrationId("google")
            .clientId("id")
            .clientSecret("secret")
            .clientName("Google")
            .authorizationGrantType(org.springframework.security.oauth2.core.AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
            .scope("openid", "profile", "email")
            .authorizationUri("https://example.com/auth")
            .tokenUri("https://example.com/token")
            .jwkSetUri("https://example.com/jwk")
            .build()

        val idToken =
            OidcIdToken("id-token", Instant.now(), Instant.now().plusSeconds(3600), mapOf("sub" to sub, "name" to name))
        val accessToken = OAuth2AccessToken(TokenType.BEARER, "token", Instant.now(), Instant.now().plusSeconds(3600))
        val request = OidcUserRequest(clientRegistration, accessToken, idToken)

        val sut = object : CustomOidcUserService(repository) {
            override fun fetchOidcUser(userRequest: OidcUserRequest): OidcUser = oidcUser
        }
        val result = sut.loadUser(request)

        // THEN: CustomOidcUser が返り、既存の id が反映される
        assert(result is CustomOidcUser)
        val custom = result as CustomOidcUser
        Assertions.assertEquals(5L, custom.userId)
        verify(repository, never()).save(any())
    }
}