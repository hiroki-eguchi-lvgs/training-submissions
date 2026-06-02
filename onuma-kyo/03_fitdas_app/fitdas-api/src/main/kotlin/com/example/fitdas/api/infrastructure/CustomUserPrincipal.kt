package com.example.fitdas.api.infrastructure

data class CustomUserPrincipal(
    val userId: Long, // アプリで新規に採番した、自分たちで管理する一意キーが入る
    val provider: String, // IdPの名前が入る。本番コードではたぶんenumにする。
    val providerId: String, // IpPの一意キー（subject)が入る
    val name: String,
    val email: String
)
