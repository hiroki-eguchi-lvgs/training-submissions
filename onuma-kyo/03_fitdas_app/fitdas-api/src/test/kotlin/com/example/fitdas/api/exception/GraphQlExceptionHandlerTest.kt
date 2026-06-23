package com.example.fitdas.api.exception

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException

class GraphQlExceptionHandlerTest {
    private val sut = GraphQlExceptionHandler()

    @Test
    @DisplayName("BusinessExceptionが渡された場合、対応するGraphQLErrorが返されること")
    fun shouldReturnGraphQLErrorWhenBusinessExceptionIsPassed() {
        // GIVEN
        val message = "ビジネスロジックエラー"
        val exception = BusinessException(message)

        // WHEN
        val result = sut.handle(exception)

        // THEN
        assertNotNull(result)
        assertEquals(message, result.message)
        assertEquals("BusinessException", result.extensions["classification"])
    }

    @Test
    @DisplayName("AuthenticationCredentialsNotFoundExceptionが渡された場合、対応するGraphQLErrorが返されること")
    fun shouldReturnGraphQLErrorWhenAuthenticationCredentialsNotFoundExceptionIsPassed() {
        // GIVEN
        val message = "認証情報が見つかりません"
        val exception = AuthenticationCredentialsNotFoundException(message)

        // WHEN
        val result = sut.handle(exception)

        // THEN
        assertNotNull(result)
        assertEquals(message, result.message)
        assertEquals("AuthenticationCredentialsNotFoundException", result.extensions["classification"])
    }

    @Test
    @DisplayName("IllegalStateExceptionが渡された場合、標準メッセージが返されること")
    fun shouldReturnGraphQLErrorWhenIllegalStateExceptionIsPassed() {
        // GIVEN
        val exception = IllegalStateException("予期しない状態")

        // WHEN
        val result = sut.handle(exception)

        // THEN
        assertNotNull(result)
        assertEquals("サーバーエラーが発生しました。", result.message)
        assertEquals("IllegalStateException", result.extensions["classification"])
    }

    @Test
    @DisplayName("その他の例外が渡された場合、デフォルトのエラーメッセージが返されること")
    fun shouldReturnGraphQLErrorWhenOtherExceptionIsPassed() {
        // GIVEN
        val exception = RuntimeException("予期しないエラー")

        // WHEN
        val result = sut.handle(exception)

        // THEN
        assertNotNull(result)
        assertEquals("予期せぬエラーが発生しました。", result.message)
        assertEquals("RuntimeException", result.extensions["classification"])
    }

    @Test
    @DisplayName("例外が渡された場合、extensionsにclassificationが含まれていること")
    fun shouldIncludeClassificationInExtensions() {
        // GIVEN
        val exception = Exception("テストエラー")

        // WHEN
        val result = sut.handle(exception)

        // THEN
        assertNotNull(result.extensions)
        assertTrue(result.extensions.containsKey("classification"))
    }
}