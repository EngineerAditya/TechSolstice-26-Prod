import Chat from '@/components/Chat';

import { memo } from 'react';
const HomePage = () => {
  return (
    <main>
      <Chat />
    </main>
  );
}

export default memo(HomePage);