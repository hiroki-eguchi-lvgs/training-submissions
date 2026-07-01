import MenuIcon from '@mui/icons-material/Menu';
import { List, ListItem, ListItemText, Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './App.css';
import type { GroupChangeMemberRolePayload, GroupDetail } from './generated/graphql';
import * as graphqlClient from './utils/GraphQLClient';

const GROUP_DETAIL = `
    query GroupDetail($id: ID!) {
        groupDetail(groupId: $id) {
            stampIssuerUserId
            memberships {
                id
                roles
                user {
                    id
                    name
                }
                currentCard {
                    generation
                    currentStamps
                }
            }
            currentMembership {
                id
                currentCard {
                    id
                    generation
                    stampHistories {
                        stampImagePath
                        createdAt
                    }
                }
            }
        }
    }
          `;

const GROUP_CHANGE_MEMBER_ROLE = `
    mutation GroupChangeMemberRole($id: ID!, $successorId: ID!, $roleCode: String!) {
        groupChangeMemberRole(id: $id, successorId: $successorId, roleCode: $roleCode) {
            group {
                id
                name
                scheduledStartAt
                slackChannelUrl
                stampsToReward
            }
        }
    }

          `;

function GroupDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [groupDetail, setGroupDetail] = useState<GroupDetail>();

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const response = await graphqlClient.graphqlFetch(GROUP_DETAIL, { id: id });
      console.log('response');
      console.log(response);
      const groupDetail = Object.values(response)[0] as GroupDetail;
      setGroupDetail(groupDetail);
    } catch (error) {
      console.error(error);
      alert('初期データの読取りに失敗しました。');
    }
  };

  // 入力完了ハンドラー
  const handleClickChangeRole = async (successorId: String, roleCode: String) => {
    try {
      const response = await graphqlClient.graphqlFetch(
        GROUP_CHANGE_MEMBER_ROLE,
        { id: id },
        { successorId: successorId },
        { roleCode: roleCode },
      );
      console.log('response');
      console.log(response);
      const payload = Object.values(response)[0] as GroupChangeMemberRolePayload;
      alert('処理が成功しました！');
      console.log('サーバーからのレスポンス:', payload);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fitdas
          </Typography>
          <Button color="inherit" onClick={() => {}}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box>
        <Grid
          container
          columns={5}
          sx={{
            '--Grid-borderWidth': '1px',
            borderTop: 'var(--Grid-borderWidth) solid',
            borderLeft: 'var(--Grid-borderWidth) solid',
            borderColor: 'divider',
            '& > div': {
              borderRight: 'var(--Grid-borderWidth) solid',
              borderBottom: 'var(--Grid-borderWidth) solid',
              borderColor: 'divider',
            },
          }}
        >
          {Array.from(Array(30)).map((_, index) => (
            <Grid
              key={index}
              size={1}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                aspectRatio: '3/2',
              }}
            >
              {groupDetail?.currentMembership?.currentCard?.stampHistories[index] && (
                <Avatar
                  sx={{ width: 56, height: 56 }}
                  src={
                    groupDetail?.currentMembership?.currentCard?.stampHistories[index]
                      .stampImagePath
                  }
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {groupDetail?.memberships.map((membership) => (
          <ListItem
            key={membership.id}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  sx={{ fontSize: '9px' }}
                  variant="contained"
                  onClick={() => {
                    handleClickChangeRole(membership.id, 'ROLE_STAMP_ISSUER');
                  }}
                >
                  スタンプ係に任命
                </Button>
                <Button
                  size="small"
                  sx={{ fontSize: '9px' }}
                  variant="outlined"
                  onClick={() => {
                    handleClickChangeRole(membership.id, 'ROLE_REWARD_MANAGER');
                  }}
                >
                  ご褒美係に任命
                </Button>
              </Stack>
            }
          >
            <ListItemText
              primary={membership.user?.name}
              secondary={
                <>
                  <p>カード: {membership.currentCard?.generation}枚目</p>
                  <p>現在のスタンプ: {membership.currentCard?.currentStamps}個</p>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
      {/* TODO: デバッグ用後で消す
      <pre>{JSON.stringify(groupDetail, null, 2)}</pre> */}
    </Box>
  );
}
export default GroupDetailScreen;
