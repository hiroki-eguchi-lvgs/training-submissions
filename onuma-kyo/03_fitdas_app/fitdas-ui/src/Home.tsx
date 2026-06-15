import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MenuIcon from '@mui/icons-material/Menu';
import StarsIcon from '@mui/icons-material/Stars';
import { Fab, List, ListItem, ListItemButton, ListItemText, Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import type { Group } from './generated/graphql';
import SimpleDialog from './SimpleDialog';
import * as graphqlClient from './utils/GraphQLClient';

const GROUPS = `
          query Groups {
              groups {
                  id
                  name
                  scheduledStartAt
                  slackChannelUrl
                  stampsToReward
              }
          }
          `;

function Home() {
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [qrCodeSource, setQrCodeSource] = useState('');

  const handleClickOpen = (dialogTitle: string, qrCodeSource: string) => {
    setDialogTitle(dialogTitle);
    setQrCodeSource(qrCodeSource);
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
    // setSelectedValue(value);
  };

  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const response = await graphqlClient.graphqlFetch(GROUPS);
      console.log('response');
      console.log(response);
      const groups = Object.values(response)[0] as Group[];
      setGroups(groups);
    } catch (error) {
      console.error(error);
      alert('初期データの読取りに失敗しました。');
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
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FITDAS
          </Typography>
          <Button color="inherit" onClick={() => {}}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {groups.map((group) => (
          <ListItem
            key={group.id}
            secondaryAction={
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => changePage(`/editGroup/${group.id}`)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    handleClickOpen(
                      'グループに参加！',
                      `${import.meta.env.VITE_CLIENT_BASE_URL}/executor/${group.id}`,
                    );
                  }}
                >
                  <GroupAddIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    handleClickOpen(
                      'スタンプを取得！',
                      `${import.meta.env.VITE_CLIENT_BASE_URL}/stampExecutor/${group.id}`,
                    );
                  }}
                >
                  <StarsIcon />
                </IconButton>
              </Stack>
            }
          >
            <ListItemButton
              onClick={() => {
                changePage(`/groupDetail/${group.id}`);
              }}
              dense
            >
              <ListItemText primary={group.name} secondary={`開始: ${group.scheduledStartAt}`} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button color="primary" onClick={() => changePage(`/editGroup`)}>
        グループを新規作成
      </Button>
      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <Fab
          color="secondary"
          onClick={() => {
            // todo;
          }}
        >
          <CameraAltIcon />
        </Fab>
      </Box>

      <SimpleDialog
        dialogTitle={dialogTitle}
        qrCodeSource={qrCodeSource}
        open={open}
        onClose={handleClose}
      />
    </Box>
  );
}
export default Home;
