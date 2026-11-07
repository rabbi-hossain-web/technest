import { MessageActions } from '@/components/admin/message-actions';
import { PageHeader } from '@/components/admin/page-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getMessages } from '@/lib/queries';
import { formatDateTime } from '@/lib/utils';

export const metadata = { title: 'Messages' };

export default async function MessagesPage() {
  const messages = await getMessages();
  const unread = messages.filter((m) => !m.read).length;
  return (
    <>
      <PageHeader title="Messages" description={`${messages.length} messages from the Support page · ${unread} unread`} />
      {messages.length === 0 && <Card className="p-10 text-center text-muted-foreground">No messages yet.</Card>}
      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <Card key={m._id} className={m.read ? 'p-5' : 'border-primary/40 p-5'}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-semibold">{m.name}</strong>
                  {!m.read && <Badge variant="info">New</Badge>}
                  <Badge variant="secondary">{m.topic}</Badge>
                  {m.orderNumber && <Badge variant="outline">{m.orderNumber}</Badge>}
                </div>
                <span className="text-[13px] text-muted-foreground">{m.email} · {formatDateTime(m.createdAt)}</span>
              </div>
              <MessageActions id={m._id} read={m.read} email={m.email} />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800">{m.message}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
