package com.example.fitdas.api.service

import com.example.fitdas.api.domain.User
import com.example.fitdas.api.infrastructure.CustomOidcUser
import com.example.fitdas.api.infrastructure.UserRepository
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.core.OAuth2AuthenticationException
import org.springframework.security.oauth2.core.oidc.user.OidcUser
import org.springframework.stereotype.Service

@Service
open class CustomOidcUserService(private val repository: UserRepository) : OidcUserService() {

    /**
     * テストでスーパークラスのネットワーク呼び出しを行わずに偽の OidcUser を提供できるよう
     * fetch 処理を切り出しています。デフォルト実装はスーパークラスの loadUser を呼び出します。
     */
    protected open fun fetchOidcUser(userRequest: OidcUserRequest): OidcUser = super.loadUser(userRequest)

    @Throws(OAuth2AuthenticationException::class)
    override fun loadUser(userRequest: OidcUserRequest): OidcUser {
        val oauth2User = fetchOidcUser(userRequest) // デフォルト実装を利用してOAuth2Userを取得

        // FIXME: 永続化は、この後発行されるInteractiveAuthenticationSuccessEventのサブスクライバーでするほうがBetterかも知れない
        val name = oauth2User.attributes["name"] as String
        val subId = oauth2User.attributes["sub"] as String
        var user = repository.findByGoogleSubId(subId.toBigInteger())
        if (user == null) {
            user = User(name, subId.toBigInteger())
            this.repository.save(user)
        }
        val userId = user.id!!
        // 認証したユーザの情報を返す。このインスタンスがセッションに保存される。
        return CustomOidcUser(userId, userRequest.clientRegistration.clientName, subId, oauth2User)
    }
}