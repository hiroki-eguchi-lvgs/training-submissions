import HomeIcon from '@mui/icons-material/Home';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import type { GroupAddMemberPayload } from './generated/graphql';
import * as graphqlClient from './utils/GraphQLClient';

const GROUP_ADD_MEMBER = `
    mutation GroupAddMember($id: ID!) {
        groupAddMember(
            id: $id
        ) {
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

function Executor() {
  const { id } = useParams<{ id: string }>();
  // IDがある場合、初期データ読み込み
  useEffect(() => {
    if (id) {
      execute(id);
    }
  }, []);

  const execute = async (id: string) => {
    try {
      const response = await graphqlClient.graphqlFetch(GROUP_ADD_MEMBER, { id: id });
      console.log('response');
      console.log(response);
      const payload = Object.values(response)[0] as GroupAddMemberPayload;
      console.log('サーバーからのレスポンス:', response);
      changePage('/');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };
  const navigate = useNavigate();
  const changePage = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => {
              changePage('/');
            }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fitdas
          </Typography>
          <Button color="inherit" onClick={() => {}}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress aria-label="Loading…" />
      </Box>
      <pre>groupId: {id}</pre>
    </Box>
  );
}

export default Executor;
