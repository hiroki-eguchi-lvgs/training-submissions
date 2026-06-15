package com.example.fitdas.api.scalars

import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsRuntimeWiring
import graphql.scalars.ExtendedScalars
import graphql.schema.idl.RuntimeWiring

@DgsComponent
class SharedScalarsRegistration {

    @DgsRuntimeWiring
    fun addScalar(builder: RuntimeWiring.Builder): RuntimeWiring.Builder {
        return builder
            .scalar(ExtendedScalars.DateTime)
            .scalar(ExtendedScalars.LocalTime)
            .scalar(ExtendedScalars.Url)
    }
}