package com.example.fitdas.api.common.extension

import java.time.Instant
import java.time.OffsetDateTime
import java.time.ZoneOffset

val JST: ZoneOffset? = ZoneOffset.ofHours(9)

fun Instant.toJST(): OffsetDateTime {
    return this.atOffset(ZoneOffset.UTC)
        .withOffsetSameInstant(JST)
}