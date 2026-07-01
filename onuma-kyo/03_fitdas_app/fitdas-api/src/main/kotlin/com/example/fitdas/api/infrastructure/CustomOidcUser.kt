package com.example.fitdas.api.infrastructure

import org.springframework.security.oauth2.core.oidc.user.OidcUser


class CustomOidcUser(
    val userId: Long, // 自分のアプリの一意キー
    private val provider: String, // 連携したIdPの名前
    private val providerId: String, // 連携したIdPの一意キー
    private val oidcUser: OidcUser // デフォルト実装のインスタンス保持用プロパティ
) : OidcUser by oidcUser /* 元の振る舞いを変更する必要がないので、Delegationパターンを適用する。kotlinはby説でネイティブにサポートしている */ {
}