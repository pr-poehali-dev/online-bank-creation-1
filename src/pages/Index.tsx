import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AuthModal from '@/components/AuthModal';
import UserDashboard from '@/components/UserDashboard';

const Index = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setAuthModalOpen(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAuthModalOpen(true);
    toast({ title: 'Вы вышли из системы' });
  };

  if (user) {
    return <UserDashboard user={user} onLogout={handleLogout} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={(open) => {
            if (!user) {
              setAuthModalOpen(true);
            } else {
              setAuthModalOpen(open);
            }
          }} 
          onSuccess={setUser} 
        />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="Landmark" className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NeoBанк
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Для доступа к системе необходимо войти
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => setAuthModalOpen(true)}
              size="lg"
            >
              <Icon name="LogIn" className="mr-2" size={20} />
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLoanApplication = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Заявка отправлена! ✅",
      description: "Решение по кредиту будет готово в течение 2 минут",
    });
  };

  const handleCardApplication = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Заявка принята! 🎉",
      description: "Карта будет выпущена моментально после одобрения",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Icon name="Landmark" className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NeoBанк
              </span>
            </div>
            
            <div className="hidden md:flex gap-6">
              {['Главная', 'Кредиты'].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveSection(item.toLowerCase())}
                  className="text-foreground/80 hover:text-foreground transition-colors relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>

            <Button
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => setAuthModalOpen(true)}
            >
              Войти
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
              Онлайн-банк будущего
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Банкинг{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                нового поколения
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Моментальные решения по кредитам и картам. Управляйте финансами из любой точки мира.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8">
                <Icon name="Sparkles" className="mr-2" size={20} />
                Открыть счёт
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary/30 hover:bg-primary/10">
                Узнать больше
              </Button>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 blur-3xl rounded-full"></div>
            <div className="relative grid grid-cols-2 gap-4">
              {[
                { icon: 'CreditCard', title: 'Карты', value: '2.5% кешбэк', color: 'from-primary to-purple-600' },
                { icon: 'PiggyBank', title: 'Вклады', value: 'До 15% годовых', color: 'from-secondary to-cyan-600' },
                { icon: 'TrendingUp', title: 'Кредиты', value: 'От 5.9% годовых', color: 'from-accent to-orange-600' },
                { icon: 'Shield', title: 'Безопасность', value: '100% защита', color: 'from-green-500 to-emerald-600' },
              ].map((item, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur border-border/50 hover:scale-105 transition-transform duration-300 animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
                      <Icon name={item.icon as any} className="text-white" size={24} />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-primary font-semibold">{item.value}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20" id="services">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Наши <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">услуги</span>
          </h2>
          <p className="text-xl text-muted-foreground">Всё необходимое для управления вашими финансами</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: 'Wallet',
              title: 'Переводы',
              description: 'Мгновенные переводы по номеру телефона и реквизитам',
              features: ['Без комиссии', 'Круглосуточно', '24/7 поддержка'],
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: 'CreditCard',
              title: 'Дебетовые карты',
              description: 'Карты с кешбэком до 5% и бесплатным обслуживанием',
              features: ['2.5% кешбэк', 'Бесплатно', 'Apple/Google Pay'],
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: 'TrendingUp',
              title: 'Кредиты',
              description: 'Онлайн-заявка с моментальным решением за 2 минуты',
              features: ['От 5.9%', 'До 5 млн ₽', 'Решение за 2 мин'],
              gradient: 'from-orange-500 to-red-500'
            },
            {
              icon: 'PiggyBank',
              title: 'Вклады',
              description: 'Выгодные ставки до 15% годовых с возможностью пополнения',
              features: ['До 15% годовых', 'От 10 тыс ₽', 'Снятие без потерь'],
              gradient: 'from-green-500 to-emerald-500'
            },
            {
              icon: 'Building',
              title: 'Ипотека',
              description: 'Ипотечные программы с минимальной ставкой',
              features: ['От 7.9%', 'До 30 лет', 'От 15% первый взнос'],
              gradient: 'from-indigo-500 to-purple-500'
            },
            {
              icon: 'LineChart',
              title: 'Инвестиции',
              description: 'Доступ к фондовому рынку и готовые портфели',
              features: ['Акции, облигации', 'От 1000 ₽', 'Роботы-советники'],
              gradient: 'from-yellow-500 to-orange-500'
            },
          ].map((service, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 group">
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon name={service.icon as any} className="text-white" size={28} />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Icon name="Check" className="text-primary" size={16} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20" id="applications">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Подать <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">заявку онлайн</span>
            </h2>
            <p className="text-xl text-muted-foreground">Моментальное решение за 2 минуты</p>
          </div>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Онлайн-заявки</CardTitle>
              <CardDescription>Выберите продукт и заполните форму для мгновенного решения</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="loan" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="loan" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Icon name="TrendingUp" className="mr-2" size={16} />
                    Кредит
                  </TabsTrigger>
                  <TabsTrigger value="card" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                    <Icon name="CreditCard" className="mr-2" size={16} />
                    Карта
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="loan">
                  <form onSubmit={handleLoanApplication} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="loan-name">ФИО</Label>
                        <Input id="loan-name" placeholder="Иванов Иван Иванович" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loan-phone">Телефон</Label>
                        <Input id="loan-phone" type="tel" placeholder="+7 (900) 123-45-67" required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="loan-amount">Сумма кредита</Label>
                        <Input id="loan-amount" type="number" placeholder="500000" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loan-term">Срок (месяцев)</Label>
                        <Input id="loan-term" type="number" placeholder="24" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-income">Ежемесячный доход</Label>
                      <Input id="loan-income" type="number" placeholder="80000" required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" size="lg">
                      <Icon name="Sparkles" className="mr-2" size={20} />
                      Получить решение за 2 минуты
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="card">
                  <form onSubmit={handleCardApplication} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-name">ФИО</Label>
                        <Input id="card-name" placeholder="Иванов Иван Иванович" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-phone">Телефон</Label>
                        <Input id="card-phone" type="tel" placeholder="+7 (900) 123-45-67" required />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-birthdate">Дата рождения</Label>
                        <Input id="card-birthdate" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-passport">Серия и номер паспорта</Label>
                        <Input id="card-passport" placeholder="1234 567890" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-address">Адрес регистрации</Label>
                      <Input id="card-address" placeholder="г. Москва, ул. Примерная, д. 1" required />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-secondary to-primary hover:opacity-90" size="lg">
                      <Icon name="CreditCard" className="mr-2" size={20} />
                      Оформить карту моментально
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: 'Users', value: '2.5M+', label: 'Активных клиентов' },
            { icon: 'Award', value: '99.9%', label: 'Время работы' },
            { icon: 'Star', value: '4.9', label: 'Рейтинг в App Store' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Icon name={stat.icon as any} className="text-white" size={32} />
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-card/50 backdrop-blur border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">Все права защищены © 2025</p>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={setUser}
      />
    </div>
  );
};

export default Index;