import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // 1. スキーマファイルのパス（URLでバックエンドを指定することも可能）
  schema: '../fitdas-api/src/main/resources/schema/schema.graphqls',
  generates: {
    // 2. 出力先のファイルパス
    'src/generated/graphql.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
