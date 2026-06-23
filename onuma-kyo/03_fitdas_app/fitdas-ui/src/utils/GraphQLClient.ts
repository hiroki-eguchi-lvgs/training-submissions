export const graphqlFetch = async (query: string, ...input: Object[]) => {
  // 渡された複数のオブジェクトを1つにマージする
  const mergedInput = Object.assign({}, ...input);
  console.log('mergedInput');
  console.log(mergedInput);
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: mergedInput,
    }),
    // ポートが違ってもクッキーを送信する
    credentials: 'include',
  });
  const resObject = await res.json();
  console.log('resObject');
  console.log(resObject);
  // エラーハンドリング
  if (resObject.errors) {
    const businessErrorMessages: string[] = [];
    for (let error of resObject.errors) {
      console.error(`Error: ${error.message}`);
      console.log(error);
      // 業務エラーが存在する場合、呼び出し元に通知する
      if (
        error?.extensions?.classification === 'BusinessException' ||
        error?.extensions?.classification === 'AuthenticationCredentialsNotFoundException'
      ) {
        businessErrorMessages.push(error.message);
      }
    }
    throw new Error(
      businessErrorMessages.length === 0
        ? 'サーバーエラーが発生しました'
        : businessErrorMessages.join('\n'),
    );
  }
  return resObject.data;
};
