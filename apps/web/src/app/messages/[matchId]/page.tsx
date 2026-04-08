import ChatClient from './ChatClient';

export async function generateStaticParams() {
  // Static export requires at least one param. Use a placeholder.
  // Client-side navigation from the messages list will still work
  // because Next.js resolves these routes at runtime in the browser.
  return [{ matchId: 'chat' }];
}

export default function ChatPage() {
  return <ChatClient />;
}
