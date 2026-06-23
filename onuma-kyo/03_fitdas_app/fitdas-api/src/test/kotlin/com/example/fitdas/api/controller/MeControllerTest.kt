package com.example.fitdas.api.controller

import com.example.fitdas.api.domain.entity.User
import com.example.fitdas.api.infrastructure.CustomOidcUser
import com.example.fitdas.api.scalars.SharedScalarsRegistration
import com.example.fitdas.api.service.UserService
import com.netflix.graphql.dgs.DgsQueryExecutor
import com.netflix.graphql.dgs.test.EnableDgsTest
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.test.context.bean.override.mockito.MockitoBean
import java.math.BigInteger


@SpringBootTest(
    classes = [
        MeController::class,
        SharedScalarsRegistration::class // NOTE: カスタムスカラーの定義クラスも読み込む必要がある
    ]
)
@EnableDgsTest
class MeControllerTest {

    @Autowired
    lateinit var
            dgsQueryExecutor: DgsQueryExecutor

    @MockitoBean
    lateinit var
            userService: UserService

    @BeforeEach
    fun setUp() {
        // userService の挙動をモックする
        val dummyUser = User(
            name = "testUser",
            googleSubId = BigInteger.valueOf(1),
        )
        dummyUser.id = 1L
        Mockito.`when`(userService.user(1L)).thenReturn(dummyUser)
        // ダミーのログインユーザー（CustomOidcUser）を作成してセットする
        val oidcUser: OidcUser = DefaultOidcUser(
            AuthorityUtils.createAuthorityList("SCOPE_message:read"),
            OidcIdToken.withTokenValue("id-token").claim("user_name", "foo_user").build(),
            "user_name"
        )
        val principal = CustomOidcUser(
            userId = 1L,
            provider = "",
            providerId = "",
            oidcUser
        )
        SecurityContextHolder.getContext().authentication = OAuth2AuthenticationToken(
            principal,
            emptyList<GrantedAuthority>(),
            "id"
        )
    }

    @Test
    fun me() {

        // 3. GraphQLクエリを実行し、JsonPathを修正（単一オブジェクトなので [*] は不要）
        val userId: String = dgsQueryExecutor.executeAndExtractJsonPath(
            """
        {
            me {
                userId
                migratingStatus
            }
        }
        """.trimIndent(),
            "data.me.userId" // ★ 修正: 単一のStringとして取得
        )

        // 4. アサーションの修正 (1L をモックしたので、文字列の "1" が返ってくるはず)
        assertThat(userId).isEqualTo("1")
    }
}