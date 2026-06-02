import HomeIcon from '@mui/icons-material/Home';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import type {
  Group,
  GroupCreatePayload,
  GroupInput,
  GroupUpdatePayload,
} from './generated/graphql';
import * as graphqlClient from './utils/GraphQLClient';

type FormData = {
  name: string;
  scheduledStartAt: string;
  slackChannelUrl: string;
  stampsToReward: string;
};

type FormErrors = {
  name?: string;
  scheduledStartAt?: string;
  slackChannelUrl?: string;
};

const GROUPS = `
          query Group($id: ID!) {
              group(id: $id) {
                  id
                  name
                  scheduledStartAt
                  slackChannelUrl
                  stampsToReward
              }
          }
          `;

const GROUP_CREATE = `
    mutation GroupCreate($input: GroupInput) {
        groupCreate(
            input: $input
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

const GROUP_UPDATE = `
    mutation GroupUpdate($id: ID!, $input: GroupInput) {
        groupUpdate(
            id: $id,
            input: $input
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

function EditGroup() {
  const { id } = useParams<{ id: string }>();
  const [groupId, setGroupId] = useState(id);
  // Form入力値
  const [formData, setFormData] = useState<FormData>({
    name: '',
    scheduledStartAt: '10:05',
    slackChannelUrl: '',
    stampsToReward: '30',
  });
  // Form入力エラー
  const [errors, setErrors] = useState<FormErrors>({});
  // IDがある場合、初期データ読み込み
  useEffect(() => {
    if (groupId) {
      initialize(groupId);
    }
  }, []);

  const initialize = async (id: string) => {
    try {
      const response = await graphqlClient.graphqlFetch(GROUPS, { id: id });
      console.log('response');
      console.log(response);
      const group = Object.values(response)[0] as Group;
      setFormData({
        name: group.name,
        scheduledStartAt: group.scheduledStartAt as string,
        slackChannelUrl: group.slackChannelUrl as string,
        stampsToReward: group.stampsToReward.toString(),
      });
      console.log('サーバーからのレスポンス:', response);
    } catch (error) {
      console.error(error);
      alert('初期データの読取りに失敗しました。');
    }
  };

  // 入力変更時にStateを更新する共通ハンドラー;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.name で入力欄の name 属性を取得
    const { name, value } = e.target;
    // [name]: value は「動的プロパティ名」
    setFormData((prev) => ({
      ...prev, // 既存の値をコピー
      [name]: value, // 変更された項目だけを上書き
    }));
    // 入力時にエラーをクリア
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  // バリデーション
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = '必須です';
    }
    if (!formData.scheduledStartAt.trim()) {
      newErrors.scheduledStartAt = '必須です';
    }
    if (!formData.slackChannelUrl.trim()) {
      newErrors.slackChannelUrl = '必須です';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // 入力完了ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 画面のリロードを防ぐ
    if (!validate()) {
      return;
    }
    console.log('送信するデータ:', formData);
    const input: GroupInput = {
      name: formData.name,
      scheduledStartAt: formData.scheduledStartAt,
      slackChannelUrl: formData.slackChannelUrl,
      stampIds: [],
      stampsToReward: Number(formData.stampsToReward),
    };
    try {
      // GroupのIDがある場合、更新
      // そうでない場合、新規作成
      const response = groupId
        ? await graphqlClient.graphqlFetch(GROUP_UPDATE, { id: groupId }, { input: input })
        : await graphqlClient.graphqlFetch(GROUP_CREATE, { input: input });
      console.log('response');
      console.log(response);
      const payload = Object.values(response)[0] as GroupUpdatePayload | GroupCreatePayload;
      setGroupId(payload.group?.id);
      alert('処理が成功しました！');
      console.log('サーバーからのレスポンス:', response);
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
      <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
        <TextField
          label="グループ名"
          name="name"
          value={formData.name}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          error={!(errors.name == null)}
          helperText={errors.name}
        />
        <TextField
          label="運動開始時刻"
          name="scheduledStartAt"
          value={formData.scheduledStartAt}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          type="time"
          slotProps={{
            inputLabel: { shrink: true },
          }}
          error={!(errors.scheduledStartAt == null)}
          helperText={errors.scheduledStartAt}
        />
        <TextField
          label="SlackチャンネルURL"
          name="slackChannelUrl"
          value={formData.slackChannelUrl}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          type="url"
          error={!(errors.slackChannelUrl == null)}
          helperText={errors.slackChannelUrl}
        />
        <FormControl>
          <FormLabel id="stamps-to-reward">ご褒美までのスタンプ数</FormLabel>
          <RadioGroup
            row
            name="stampsToReward"
            value={formData.stampsToReward}
            onChange={handleChange}
          >
            <FormControlLabel value="10" control={<Radio />} label="10" />
            <FormControlLabel value="15" control={<Radio />} label="15" />
            <FormControlLabel value="20" control={<Radio />} label="20" />
            <FormControlLabel value="25" control={<Radio />} label="25" />
            <FormControlLabel value="30" control={<Radio />} label="30" />
          </RadioGroup>
        </FormControl>
        <Button type="submit" variant="contained" onClick={handleSubmit}>
          OK
        </Button>
        {/* TODO: デバッグ用後で消す
        <pre>groupId: {groupId}</pre>
        <pre>{JSON.stringify(formData, null, 2)}</pre> */}
      </Box>
    </Box>
  );
}

export default EditGroup;
