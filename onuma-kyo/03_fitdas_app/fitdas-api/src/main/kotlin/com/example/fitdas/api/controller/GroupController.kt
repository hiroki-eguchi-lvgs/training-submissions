package com.example.fitdas.api.controller

import com.example.fitdas.api.codegen.types.*
import com.example.fitdas.api.domain.RoleCode
import com.example.fitdas.api.infrastructure.CustomOidcUser
import com.example.fitdas.api.service.GroupService
import com.example.fitdas.api.service.StampHistoryQueryService
import com.netflix.graphql.dgs.*
import graphql.execution.DataFetcherResult
import org.dataloader.DataLoader
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import java.net.URI
import java.util.concurrent.CompletableFuture


// TODO: 戻り値のGroupを改善（現状適当にダミー値詰めてるところがある）
@DgsComponent
class GroupController(
    private val groupService: GroupService,
    private val stampHistoryService: StampHistoryQueryService,
) {

    @DgsQuery
    suspend fun group(@InputArgument id: String): Group {
        return groupService.group(id).let {
            Group(
                id = it.id!!.toString(),
                name = it.name,
                scheduledStartAt = it.scheduledStartAt,
                slackChannelUrl = URI.create(it.slackChannelUrl).toURL(),
                stampsToReward = it.stampsToReward,
            )
        }
    }

    @DgsQuery
    suspend fun groups(): List<Group> {
        if (SecurityContextHolder.getContext().authentication?.principal !is CustomOidcUser) {
            throw AuthenticationCredentialsNotFoundException("ログインされていません。")
        }
        val user: CustomOidcUser = SecurityContextHolder.getContext().authentication?.principal as CustomOidcUser
        return groupService.findAllByUserId(user.userId).map({
            Group(
                id = it.id!!.toString(),
                name = it.name,
                scheduledStartAt = it.scheduledStartAt,
                slackChannelUrl = URI.create(it.slackChannelUrl).toURL(),
                stampsToReward = it.stampsToReward,
//                stampIssuerUserId = "",// TODO
            )
        })
    }

    @DgsMutation
    fun groupCreate(
        @InputArgument input: GroupInput,
    ): GroupCreatePayload {
        if (SecurityContextHolder.getContext().authentication?.principal !is CustomOidcUser) {
            throw AuthenticationCredentialsNotFoundException("ログインされていません。")
        }
        val user: CustomOidcUser = SecurityContextHolder.getContext().authentication?.principal as CustomOidcUser
        return groupService.createGroup(user.userId, input).let {
            GroupCreatePayload(
                group = Group(
                    id = it.id!!.toString(),
                    name = it.name,
                    scheduledStartAt = it.scheduledStartAt,
                    slackChannelUrl = URI.create(it.slackChannelUrl).toURL(),
                    stampsToReward = it.stampsToReward,
                )
            )
        }
    }

    @DgsMutation
    fun groupUpdate(@InputArgument id: String, @InputArgument input: GroupInput): GroupUpdatePayload {
        return groupService.updateGroup(id, input).let {
            GroupUpdatePayload(

                group = Group(
                    id = it.id!!.toString(),
                    name = it.name,
                    scheduledStartAt = it.scheduledStartAt,
                    slackChannelUrl = URI.create(it.slackChannelUrl).toURL(),
                    stampsToReward = it.stampsToReward,
                )
            )
        }
    }

    @DgsMutation
    fun groupAddMember(@InputArgument id: String): GroupAddMemberPayload {
        if (SecurityContextHolder.getContext().authentication?.principal !is CustomOidcUser) {
            throw AuthenticationCredentialsNotFoundException("ログインされていません。")
        }
        val user: CustomOidcUser = SecurityContextHolder.getContext().authentication?.principal as CustomOidcUser
        return groupService.addMember(id, user.userId).let {
            GroupAddMemberPayload(

                group = Group(
                    id = it.id!!.toString(),
                    name = it.name,
                    scheduledStartAt = it.scheduledStartAt,
                    slackChannelUrl = URI.create(it.slackChannelUrl).toURL(),
                    stampsToReward = it.stampsToReward,
                )
            )
        }
    }

    @DgsMutation
    fun groupChangeMemberRole(
        @InputArgument id: String,
        @InputArgument successorId: String,
        @InputArgument roleCode: String,
    ): GroupChangeMemberRolePayload {
        val roleCode = RoleCode.valueOf(roleCode)
        return groupService.changeMemberRole(id, successorId, roleCode).let {
            GroupChangeMemberRolePayload(

                group = Group(
                    id = it.id!!.toString(),
                    name = it.name,
                    scheduledStartAt = it.scheduledStartAt,
                    slackChannelUrl = URI.create(it.slackChannelUrl).toURL(),
                    stampsToReward = it.stampsToReward,

                    )
            )
        }
    }

    @DgsMutation
    fun groupStamp(
        @InputArgument id: String,
    ): GroupStampPayload {
        if (SecurityContextHolder.getContext().authentication?.principal !is CustomOidcUser) {
            throw AuthenticationCredentialsNotFoundException("ログインされていません。")
        }
        val user: CustomOidcUser = SecurityContextHolder.getContext().authentication?.principal as CustomOidcUser
        return groupService.stamp(id, user.userId).let {
            GroupStampPayload(

                group = Group(
                    id = it.id!!.toString(),
                    name = it.name,
                    scheduledStartAt = it.scheduledStartAt,
                    slackChannelUrl = URI.create(it.slackChannelUrl).toURL(),
                    stampsToReward = it.stampsToReward,
                )
            )
        }
    }

    @DgsQuery
    suspend fun groupDetail(
        @InputArgument groupId: String,
        dfe: DgsDataFetchingEnvironment
    ): DataFetcherResult<GroupDetail> {
        if (SecurityContextHolder.getContext().authentication?.principal !is CustomOidcUser) {
            throw AuthenticationCredentialsNotFoundException("ログインされていません。")
        }
        val user: CustomOidcUser = SecurityContextHolder.getContext().authentication?.principal as CustomOidcUser
        val group = if (dfe.getSelectionSet().contains("memberships")) {
            groupService.groupWithMemberships(groupId)
        } else {
            groupService.group(groupId)
        }
        val stampIssuerUserId = group.findRoleAssignment(RoleCode.ROLE_STAMP_ISSUER).membership.user.id
        // NOTE: N+1問題対策のため、GroupDetailは生焼けオブジェクトで初期化&子リゾルバのDataLoader経由で値を設定
        return DataFetcherResult.newResult<GroupDetail>()
            .data(
                GroupDetail(
                    groupId = groupId,
                    stampIssuerUserId = stampIssuerUserId.toString(),
                    // DataLoaderで取得する
                    memberships = group.toGraphQLMemberships().sortedBy { it.id },
                    currentMembership = group.findMembershipByUserId(user.userId).toGraphQLMembership()
                )
            )
            .build();
    }

    @DgsData(parentType = "Membership", field = "roles")
    fun roles(dfe: DgsDataFetchingEnvironment): CompletableFuture<List<com.example.fitdas.api.codegen.types.RoleCode>> {
        val membership = dfe.getSource<Membership>()
        val id = membership?.id ?: return CompletableFuture.completedFuture(null)
        val dataLoader: DataLoader<Long, List<com.example.fitdas.api.codegen.types.RoleCode>> =
            dfe.getDataLoader("roles") ?: throw IllegalStateException("DataLoader 'roles' not found")

        return dataLoader.load(id.toLong());
    }

    @DgsData(parentType = "Membership", field = "user")
    fun user(dfe: DgsDataFetchingEnvironment): CompletableFuture<User> {
        val membership = dfe.getSource<Membership>()
        val id = membership?.userId ?: return CompletableFuture.completedFuture(null)
        val dataLoader: DataLoader<Long, User> =
            dfe.getDataLoader("users") ?: throw IllegalStateException("DataLoader 'users' not found")

        return dataLoader.load(id.toLong());
    }

    @DgsData(parentType = "Membership", field = "currentCard")
    fun currentCard(dfe: DgsDataFetchingEnvironment): CompletableFuture<Card> {
        val membership = dfe.getSource<Membership>()
        val id = membership?.id ?: return CompletableFuture.completedFuture(null)
        val dataLoader: DataLoader<Long, Card> =
            dfe.getDataLoader("cards") ?: throw IllegalStateException("DataLoader 'cards' not found")

        return dataLoader.load(id.toLong());
    }

    @DgsData(parentType = "Card", field = "currentStamps")
    fun currentStamps(dfe: DgsDataFetchingEnvironment): Int {
        val card = dfe.getSource<Card>()
        val id = card?.id ?: return 0
        return stampHistoryService.countByCardId(id.toLong())
    }

    @DgsData(parentType = "Card", field = "stampHistories")
    fun stampHistories(dfe: DgsDataFetchingEnvironment): CompletableFuture<List<StampHistory>> {
        val card = dfe.getSource<Card>()
        val id = card?.id ?: return CompletableFuture.completedFuture(null)
        val dataLoader: DataLoader<Long, List<StampHistory>> =
            dfe.getDataLoader("stampHistories") ?: throw IllegalStateException("DataLoader 'stampHistories' not found")

        return dataLoader.load(id.toLong());
    }
}