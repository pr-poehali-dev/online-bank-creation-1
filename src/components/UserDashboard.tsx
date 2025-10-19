import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserDashboardProps {
  user: any;
  onLogout: () => void;
}

const UserDashboard = ({ user, onLogout }: UserDashboardProps) => {
  const { toast } = useToast();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [allCards, setAllCards] = useState<any[]>([]);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);

  useEffect(() => {
    loadCards();
    if (user.is_admin) {
      loadUsers();
      loadAllCards();
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

  const loadAllCards = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/d5bc3162-5c30-424f-a0a3-f49dfa4df5d3?action=all_cards');
      if (response.ok) {
        const data = await response.json();
        setAllCards(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки всех карт:', error);
    }
  };

  const handleLinkPhone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phone') as string;

    if (cards.length === 0) {
      toast({ title: 'Ошибка', description: 'У вас нет карты', variant: 'destructive' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/d5bc3162-5c30-424f-a0a3-f49dfa4df5d3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link_phone',
          card_id: cards[0].id,
          phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Телефон привязан! ✅', description: `Номер ${phone} привязан к карте` });
        loadCards();
        setPhoneDialogOpen(false);
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось привязать телефон', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const to_identifier = formData.get('to-identifier') as string;
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
          to_identifier,
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
        if (user.is_admin) {
          loadAllCards();
        }
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
        loadAllCards();
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

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту карту?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/d5bc3162-5c30-424f-a0a3-f49dfa4df5d3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_card',
          card_id: cardId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({ title: 'Карта удалена! ✅', description: 'Карта успешно удалена из системы' });
        loadAllCards();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить карту', variant: 'destructive' });
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
          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="cards">Все карты</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="balance">Пополнение</TabsTrigger>
            </TabsList>

            <TabsContent value="cards">
              <Card>
                <CardHeader>
                  <CardTitle>Все карты пользователей</CardTitle>
                  <CardDescription>Просмотр реквизитов и управление картами</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allCards.length === 0 && (
                      <p className="text-sm text-muted-foreground">Карты не найдены</p>
                    )}
                    {allCards.map((card) => (
                      <div key={card.id} className="p-6 border rounded-lg space-y-4 bg-gradient-to-r from-card to-card/50 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            <div>
                              <p className="font-bold text-lg">{card.first_name} {card.last_name}</p>
                              <p className="text-sm text-muted-foreground">{card.email}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Icon name="CreditCard" size={16} className="text-primary" />
                                <span className="font-mono text-base">{card.card_number}</span>
                              </div>
                              
                              {card.phone && (
                                <div className="flex items-center gap-2">
                                  <Icon name="Phone" size={16} className="text-primary" />
                                  <span className="text-base">{card.phone}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Icon name="Wallet" size={16} className="text-primary" />
                                <span className="text-xl font-bold text-primary">
                                  {parseFloat(card.balance).toLocaleString('ru-RU')} ₽
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Icon name="Calendar" size={14} />
                                <span>Создана: {new Date(card.created_at).toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCard(card.id)}
                            disabled={loading}
                          >
                            <Icon name="Trash2" className="mr-2" size={14} />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CreditCard" size={24} />
                    Моя карта
                  </CardTitle>
                  {cards.length > 0 && !cards[0].phone && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPhoneDialogOpen(true)}
                    >
                      <Icon name="Phone" className="mr-2" size={14} />
                      Привязать телефон
                    </Button>
                  )}
                </div>
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
                      {cards[0].phone && (
                        <div className="flex items-center gap-2 text-white/80">
                          <Icon name="Phone" size={16} />
                          <span>{cards[0].phone}</span>
                        </div>
                      )}
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
                <CardDescription>Переведите деньги по номеру карты или телефона</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="to-identifier">Номер карты или телефона</Label>
                    <Input
                      id="to-identifier"
                      name="to-identifier"
                      placeholder="1234 5678 9012 3456 или +79001234567"
                      required
                      disabled={cards.length === 0}
                    />
                    <p className="text-xs text-muted-foreground">
                      Введите номер карты (16 цифр) или номер телефона получателя
                    </p>
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

      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Привязать номер телефона</DialogTitle>
            <DialogDescription>
              Привяжите номер телефона к карте для получения переводов
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLinkPhone} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Номер телефона</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+79001234567"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                  Привязка...
                </>
              ) : (
                <>
                  <Icon name="Phone" className="mr-2" size={16} />
                  Привязать телефон
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;