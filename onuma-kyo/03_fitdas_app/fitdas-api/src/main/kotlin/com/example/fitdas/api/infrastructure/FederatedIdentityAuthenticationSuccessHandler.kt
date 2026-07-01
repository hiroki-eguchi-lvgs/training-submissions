package com.example.fitdas.api.infrastructure

import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler
import java.io.IOException

class FederatedIdentityAuthenticationSuccessHandler(
    private val clientBaseUrl: String
) : AuthenticationSuccessHandler {
    private val delegate: AuthenticationSuccessHandler

    init {
        this.delegate = SavedRequestAwareAuthenticationSuccessHandler()
        // ① ログイン成功時のデフォルトの遷移先を 「SPAの画面」 に指定
        this.delegate.setDefaultTargetUrl(clientBaseUrl)
        // ② 本来アクセスしようとしていたページ（RequestCache）を無視し、
        //    常に上記のデフォルトURLへ強制リダイレクトさせる設定
        this.delegate.setAlwaysUseDefaultTargetUrl(true)
    }

    // 前提条件：認証成功
    @Throws(IOException::class, ServletException::class)
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        this.delegate.onAuthenticationSuccess(request, response, authentication)
    }
}


