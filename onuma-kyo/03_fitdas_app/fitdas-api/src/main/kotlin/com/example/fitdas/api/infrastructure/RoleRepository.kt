package com.example.fitdas.api.infrastructure

import com.example.fitdas.api.domain.entity.Role
import com.example.fitdas.api.domain.entity.RoleCode
import org.springframework.data.jpa.repository.JpaRepository

interface RoleRepository : JpaRepository<Role, Long> {
    // NOTE: 戻り値はNull許容型を採用。JavaのStream/Optionalよりスッキリ書けるため、
    // データが1件存在する場合: その Role インスタンスが返ります。
    // データが0件の場合: null が返ります。
    fun findByCode(roleCode: RoleCode): Role?
}