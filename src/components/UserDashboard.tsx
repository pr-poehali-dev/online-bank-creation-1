import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserDashboardProps {
  user: any;
  onLogout: () => void;
}

const UserDashboard = ({ user, onLogout }: UserDashboardProps) => {
  const { toast } = useToast();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadCards();
    if (user.is_admin) {
      loadUsers();
    }
  }, [user]);

  const loadCards = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/d5bc3162-5c30-424f-a0a3-f49dfa4df5d3?user_id=${user.id}`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Ошибка загрузки карт:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/ad3c336e-0946-4d63-8539-08109aeab478?action=list_users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const to_card_number = formData.get('to-card') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (cards.length === 0) {
      toast({ title: 'Ошибка', description: 'У вас нет карты для перевода', variant: 'destructive' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/d5bc3162-5c30-424f-a0a3-f49dfa4df5d3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          from_card_number: cards[0].card_number,
          to_card_number,
          amount,
          description
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Перевод выполнен! ✅', description: `Переведено ${amount} ₽` });
        loadCards();
        (e.target as HTMLFormElement).reset();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось выполнить перевод', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (userId: number, initialBalance: number) => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/d5bc3162-5c30-424f-a0a3-f49dfa4df5d3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_card',
          user_id: userId,
          initial_balance: initialBalance
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Карта создана! 🎉', description: `Номер: ${data.card_number}` });
        loadCards();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать карту', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const card_number = formData.get('card-number') as string;
    const amount = parseFloat(formData.get('top-up-amount') as string);

    try {
      const response = await fetch('https://functions.poehali.dev/d5bc3162-5c30-424f-a0a3-f49dfa4df5d3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_balance',
          card_number,
          amount
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Баланс пополнен! ✅', description: `+${amount} ₽` });
        loadCards();
        (e.target as HTMLFormElement).reset();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось пополнить баланс', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {user.is_admin ? 'Админ-панель' : 'Личный кабинет'}
            </h1>
            <p className="text-muted-foreground">
              {user.first_name} {user.last_name}
            </p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" className="mr-2" size={16} />
            Выйти
          </Button>
        </div>

        {user.is_admin ? (
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="balance">Пополнение баланса</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Управление картами пользователей</CardTitle>
                    <CardDescription>Создавайте карты для пользователей банка</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.length === 0 && (
                        <p className="text-sm text-muted-foreground">Пользователи не найдены</p>
                      )}
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{u.first_name} {u.last_name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                          <Button onClick={() => handleCreateCard(u.id, 0)} disabled={loading}>
                            <Icon name="CreditCard" className="mr-2" size={16} />
                            Создать карту
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="balance">
              <Card>
                <CardHeader>
                  <CardTitle>Пополнение баланса карты</CardTitle>
                  <CardDescription>Добавьте средства на карту пользователя</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddBalance} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Номер карты</Label>
                      <Input
                        id="card-number"
                        name="card-number"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="top-up-amount">Сумма пополнения</Label>
                      <Input
                        id="top-up-amount"
                        name="top-up-amount"
                        type="number"
                        step="0.01"
                        placeholder="1000"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                          Пополнение...
                        </>
                      ) : (
                        <>
                          <Icon name="Plus" className="mr-2" size={16} />
                          Пополнить баланс
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary to-secondary text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CreditCard" size={24} />
                  Моя карта
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cards.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-white/80">У вас пока нет карты</p>
                    <Button
                      variant="secondary"
                      onClick={() => handleCreateCard(user.id, 0)}
                      disabled={loading}
                    >
                      <Icon name="Plus" className="mr-2" size={16} />
                      Запросить карту
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-2xl font-mono tracking-wider">
                        {cards[0].card_number}
                      </p>
                      <p className="text-lg">{cards[0].card_holder}</p>
                    </div>
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-white/80 text-sm mb-1">Баланс</p>
                      <p className="text-3xl font-bold">{parseFloat(cards[0].balance).toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ArrowRightLeft" size={24} />
                  Перевод средств
                </CardTitle>
                <CardDescription>Переведите деньги на другую карту</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="to-card">Номер карты получателя</Label>
                    <Input
                      id="to-card"
                      name="to-card"
                      placeholder="1234 5678 9012 3456"
                      required
                      disabled={cards.length === 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Сумма перевода</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="1000"
                      required
                      disabled={cards.length === 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Комментарий (опционально)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Оплата услуг"
                      disabled={cards.length === 0}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                    disabled={loading || cards.length === 0}
                  >
                    {loading ? (
                      <>
                        <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" className="mr-2" size={16} />
                        Перевести
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
