package com.example.fitdas.api.logic

import java.time.*


object ClockProvider {
    private val DEFAULT_ZONE: ZoneId = ZoneId.systemDefault()

    private val clock: Clock = Clock.system(DEFAULT_ZONE)

    /**
     * 現在のLocalDateTimeを取得
     */
    fun now(): LocalDateTime? {
        return LocalDateTime.now(clock)
    }

    /**
     * 現在のLocalDateTimeを取得（指定タイムゾーン）
     */
    fun now(zoneId: ZoneId?): LocalDateTime? {
        return LocalDateTime.now(clock.withZone(zoneId))
    }

    /**
     * 現在のLocalDateを取得
     */
    fun today(): LocalDate? {
        return LocalDate.now(clock)
    }

    /**
     * 現在のLocalDateを取得（指定タイムゾーン）
     */
    fun today(zoneId: ZoneId?): LocalDate? {
        return LocalDate.now(clock.withZone(zoneId))
    }

    /**
     * 現在のOffsetDateTimeを取得（システムデフォルトタイムゾーン）
     */
    fun nowOffset(): OffsetDateTime? {
        return OffsetDateTime.now(clock)
    }

    /**
     * 現在のOffsetDateTimeを取得（指定タイムゾーン）
     */
    fun nowOffset(zoneId: ZoneId?): OffsetDateTime? {
        return OffsetDateTime.now(clock.withZone(zoneId))
    }

    /**
     * 現在のOffsetDateTimeを取得（UTC）
     */
    fun nowUtc(): OffsetDateTime? {
        return OffsetDateTime.now(clock.withZone(ZoneOffset.UTC))
    }

    /**
     * 現在のZonedDateTimeを取得（指定タイムゾーン）
     */
    fun nowZoned(zoneId: ZoneId?): ZonedDateTime? {
        return ZonedDateTime.now(clock.withZone(zoneId))
    }
}