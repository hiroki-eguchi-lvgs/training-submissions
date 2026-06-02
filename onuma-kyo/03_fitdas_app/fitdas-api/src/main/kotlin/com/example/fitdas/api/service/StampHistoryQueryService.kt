package com.example.fitdas.api.service

import com.example.fitdas.api.codegen.types.StampHistory
import com.example.fitdas.api.common.extension.toJST
import com.example.fitdas.api.infrastructure.StampHistoryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

interface StampHistoryQueryService {
    fun countByCardId(cardId: Long): Int
    fun findAllByCardIds(cardIds: Set<Long>): Map<Long, List<StampHistory>>
}

/*
* NOTE: READの責務のみを持つService、Logicを挟むと冗長になるため直接Repositoryに依存する
*/
@Service
@Transactional(readOnly = true)
class StampHistoryQueryServiceImpl(
    private val repository: StampHistoryRepository
) : StampHistoryQueryService {
    override fun countByCardId(cardId: Long): Int = repository.countByCardId(cardId)
    override fun findAllByCardIds(cardIds: Set<Long>): Map<Long, List<StampHistory>> {
        // StampHistoryの検索結果が空のcardIdに対しても空のリストが紐づくように結果のMapを初期化
        val cardIdToStampHistory = cardIds.associateWith({ mutableListOf<StampHistory>() })
        repository.findAllWithStampsByCardIds(cardIds).forEach {
            cardIdToStampHistory[it.card.id]?.add(
                StampHistory(
                    stampImagePath = it.stamp.imagePath,
                    createdAt = it.createdAt!!.toJST()
                )
            )
        }
        return cardIdToStampHistory
    }
}