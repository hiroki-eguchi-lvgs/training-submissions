import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useState } from 'react';
import './App.css';
import type { UserUpdatePayload } from './generated/graphql';
import * as graphqlClient from './utils/GraphQLClient';

type FormData = {
  isMigrating: boolean;
  migratingStamps: string;
};

type FormErrors = {
  migratingStamps?: string;
};

const USER_UPDATE = `
    mutation UserUpdate($migratingStamps: Int!) {
        userUpdate(migratingStamps: $migratingStamps) {
            user {
                id
                name
            }
        }
    }
          `;

function StampMigration() {
  // Form入力値
  const [formData, setFormData] = useState<FormData>({
    isMigrating: false,
    migratingStamps: '',
  });
  // Form入力エラー
  const [errors, setErrors] = useState<FormErrors>({});

  // 入力変更時にStateを更新する共通ハンドラー;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.name で入力欄の name 属性を取得
    const { name, value } = e.target;
    const newValue = name === 'isMigrating' ? value === 'true' : value;
    // [name]: value は「動的プロパティ名」
    setFormData((prev) => ({
      ...prev, // 既存の値をコピー
      [name]: newValue, // 変更された項目だけを上書き
    }));
    // 入力時にエラーをクリア
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  // バリデーション
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.isMigrating && !formData.migratingStamps) {
      newErrors.migratingStamps = '必須です';
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
    const migratingStamps = formData.isMigrating ? Number(formData.migratingStamps) : 0;
    try {
      const response = await graphqlClient.graphqlFetch(USER_UPDATE, {
        migratingStamps: migratingStamps,
      });
      console.log('response');
      console.log(response);
      const payload = Object.values(response)[0] as UserUpdatePayload;
      alert('処理が成功しました！');
      console.log('サーバーからのレスポンス:', response);
      refreshApp();
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  // NOTE: バックエンドMeエンドポイントからMigratingStatusを再取得するためあえてリロードさせる
  const refreshApp = () => {
    window.location.href = '/';
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Fitdas
          </Typography>
          <Button color="inherit" onClick={() => {}}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
        <FormControl sx={{ marginTop: '8px' }}>
          <FormLabel>紙のカードから移行するスタンプは有りますか？</FormLabel>
          <RadioGroup
            row
            name="isMigrating"
            value={formData.isMigrating}
            onChange={handleChange}
            sx={{ justifyContent: 'center' }}
          >
            <FormControlLabel value={true} control={<Radio />} label="あり" />
            <FormControlLabel value={false} control={<Radio />} label="なし" />
          </RadioGroup>
        </FormControl>
        <TextField
          label="移行するスタンプ数"
          select
          name="migratingStamps"
          value={formData.migratingStamps}
          defaultValue={formData.migratingStamps}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          error={!(errors.migratingStamps == null)}
          helperText={errors.migratingStamps}
          disabled={!formData.isMigrating}
        >
          {[...Array(29)].map((_, index) => (
            <MenuItem key={index + 1} value={index + 1}>
              {index + 1}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Button type="submit" variant="contained" onClick={handleSubmit}>
        OK
      </Button>
      {/* TODO: デバッグ用後で消す
      <pre>
        {JSON.stringify({ formdata: formData, type: typeof formData.isMigrating }, null, 2)}
      </pre> */}
    </Box>
  );
}

export default StampMigration;
