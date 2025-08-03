import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { 
  LogIn, 
  LogOut, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Users, 
  Factory,
  AlertTriangle,
  Clock,
  CheckCircle,
  Play,
  User,
  Shield,
  Crown
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  password: string;
  role: 'user' | 'yönetici' | 'admin';
}

interface ProductionPlan {
  id: string;
  productName: string;
  quantity: number;
  machine: string;
  createdBy: string;
  createdAt: string;
  priority: 'urgent' | 'normal';
  status: 'waiting' | 'in-progress' | 'completed';
  startedBy?: string;
  startedAt?: string;
  completedBy?: string;
  completedAt?: string;
}

const MACHINES = [
  'Hat 1 - Kesim',
  'Hat 2 - Montaj',
  'Hat 3 - Boyama',
  'Hat 4 - Paketleme',
  'Hat 5 - Kalite Kontrol'
];

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' },
  { id: '2', username: 'yonetici', password: 'yonetici123', role: 'yönetici' },
  { id: '3', username: 'kullanici', password: 'kullanici123', role: 'user' }
];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [completedWork, setCompletedWork] = useState<ProductionPlan[]>([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newPlan, setNewPlan] = useState({
    productName: '',
    quantity: '',
    machine: '',
    priority: 'normal' as 'urgent' | 'normal'
  });
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user' as 'user' | 'yönetici' | 'admin'
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }

    const savedPlans = localStorage.getItem('productionPlans');
    if (savedPlans) {
      setProductionPlans(JSON.parse(savedPlans));
    }

    const savedCompleted = localStorage.getItem('completedWork');
    if (savedCompleted) {
      setCompletedWork(JSON.parse(savedCompleted));
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('productionPlans', JSON.stringify(productionPlans));
  }, [productionPlans]);

  useEffect(() => {
    localStorage.setItem('completedWork', JSON.stringify(completedWork));
  }, [completedWork]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginForm({ username: '', password: '' });
      toast({
        title: "Giriş Başarılı",
        description: `Hoş geldiniz, ${user.username}!`,
      });
    } else {
      toast({
        title: "Giriş Hatası",
        description: "Kullanıcı adı veya şifre hatalı.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast({
      title: "Çıkış Yapıldı",
      description: "Başarıyla çıkış yaptınız.",
    });
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.productName || !newPlan.quantity || !newPlan.machine) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    const plan: ProductionPlan = {
      id: Date.now().toString(),
      productName: newPlan.productName,
      quantity: parseInt(newPlan.quantity),
      machine: newPlan.machine,
      createdBy: currentUser!.username,
      createdAt: new Date().toLocaleString('tr-TR'),
      priority: newPlan.priority,
      status: 'waiting'
    };

    setProductionPlans([...productionPlans, plan]);
    setNewPlan({ productName: '', quantity: '', machine: '', priority: 'normal' });
    
    toast({
      title: "Plan Eklendi",
      description: `${plan.productName} üretim planı oluşturuldu.`,
    });
  };

  const handleStartProduction = (planId: string) => {
    setProductionPlans(plans => 
      plans.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              status: 'in-progress' as const,
              startedBy: currentUser!.username,
              startedAt: new Date().toLocaleString('tr-TR')
            }
          : plan
      )
    );
    
    toast({
      title: "Üretim Başlatıldı",
      description: "Ürün üretimi başlatıldı.",
    });
  };

  const handleCompleteProduction = (planId: string) => {
    const plan = productionPlans.find(p => p.id === planId);
    if (plan) {
      const completedPlan: ProductionPlan = {
        ...plan,
        status: 'completed',
        completedBy: currentUser!.username,
        completedAt: new Date().toLocaleString('tr-TR')
      };
      
      setCompletedWork([...completedWork, completedPlan]);
      setProductionPlans(plans => plans.filter(p => p.id !== planId));
      
      toast({
        title: "Üretim Tamamlandı",
        description: `${plan.productName} üretimi tamamlandı.`,
      });
    }
  };

  const handleDeletePlan = (planId: string) => {
    setProductionPlans(plans => plans.filter(p => p.id !== planId));
    toast({
      title: "Plan Silindi",
      description: "Üretim planı silindi.",
    });
  };

  const handleTogglePriority = (planId: string) => {
    setProductionPlans(plans =>
      plans.map(plan =>
        plan.id === planId
          ? { ...plan, priority: plan.priority === 'urgent' ? 'normal' : 'urgent' }
          : plan
      )
    );
    
    toast({
      title: "Öncelik Güncellendi",
      description: "Ürün önceliği değiştirildi.",
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Hata",
        description: "Kullanıcı adı ve şifre gereklidir.",
        variant: "destructive",
      });
      return;
    }

    if (users.some(u => u.username === newUser.username)) {
      toast({
        title: "Hata",
        description: "Bu kullanıcı adı zaten kullanılıyor.",
        variant: "destructive",
      });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role
    };

    setUsers([...users, user]);
    setNewUser({ username: '', password: '', role: 'user' });
    setIsAddUserOpen(false);
    
    toast({
      title: "Kullanıcı Eklendi",
      description: `${user.username} başarıyla eklendi.`,
    });
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (users.some(u => u.username === editingUser.username && u.id !== editingUser.id)) {
      toast({
        title: "Hata",
        description: "Bu kullanıcı adı zaten kullanılıyor.",
        variant: "destructive",
      });
      return;
    }

    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    setIsEditUserOpen(false);
    
    toast({
      title: "Kullanıcı Güncellendi",
      description: "Kullanıcı bilgileri güncellendi.",
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      toast({
        title: "Hata",
        description: "Kendi hesabınızı silemezsiniz.",
        variant: "destructive",
      });
      return;
    }

    setUsers(users.filter(u => u.id !== userId));
    toast({
      title: "Kullanıcı Silindi",
      description: "Kullanıcı başarıyla silindi.",
    });
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Ürün Adı', 'Miktar', 'Makine', 'Oluşturan', 'Oluşturma Tarihi', 'Başlatan', 'Başlama Zamanı', 'Tamamlayan', 'Tamamlanma Tarihi'].join(','),
      ...completedWork.map(work => [
        work.productName,
        work.quantity,
        work.machine,
        work.createdBy,
        work.createdAt,
        work.startedBy || '',
        work.startedAt || '',
        work.completedBy || '',
        work.completedAt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'biten_isler.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Dışa Aktarıldı",
      description: "Biten işler Excel dosyası olarak indirildi.",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'yönetici': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'yönetici': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortProductionPlans = (plans: ProductionPlan[]) => {
    return plans.sort((a, b) => {
      // First sort by status (in-progress first)
      if (a.status !== b.status) {
        if (a.status === 'in-progress') return -1;
        if (b.status === 'in-progress') return 1;
      }
      
      // Then by priority (urgent first)
      if (a.priority !== b.priority) {
        if (a.priority === 'urgent') return -1;
        if (b.priority === 'urgent') return 1;
      }
      
      // For in-progress items, sort by start time (newest first)
      if (a.status === 'in-progress' && b.status === 'in-progress') {
        return new Date(b.startedAt || '').getTime() - new Date(a.startedAt || '').getTime();
      }
      
      // For waiting items, sort by creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Üretim Yönetim Sistemi</CardTitle>
            <CardDescription>Hesabınıza giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Factory className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Üretim Yönetim Sistemi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(currentUser.role)}
                <span className="text-sm font-medium text-gray-700">{currentUser.username}</span>
                <Badge className={getRoleBadgeColor(currentUser.role)}>
                  {currentUser.role}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="production" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="production">Üretim Planları</TabsTrigger>
            <TabsTrigger value="completed">Biten İşler</TabsTrigger>
            {currentUser.role === 'admin' && (
              <TabsTrigger value="users">Kullanıcı Yönetimi</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="production" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Üretim Planı</CardTitle>
                <CardDescription>Yeni bir üretim planı oluşturun</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPlan} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Ürün Adı</Label>
                    <Input
                      id="productName"
                      value={newPlan.productName}
                      onChange={(e) => setNewPlan({ ...newPlan, productName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Miktar</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newPlan.quantity}
                      onChange={(e) => setNewPlan({ ...newPlan, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="machine">Makine/Hat</Label>
                    <Select value={newPlan.machine} onValueChange={(value) => setNewPlan({ ...newPlan, machine: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Makine seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {MACHINES.map((machine) => (
                          <SelectItem key={machine} value={machine}>
                            {machine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Öncelik</Label>
                    <Select value={newPlan.priority} onValueChange={(value: 'urgent' | 'normal') => setNewPlan({ ...newPlan, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">🔥 Acil</SelectItem>
                        <SelectItem value="normal">📋 Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Plan Ekle
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {MACHINES.map((machine) => {
                const machinePlans = sortProductionPlans(
                  productionPlans.filter(plan => plan.machine === machine)
                );
                const inProgressPlans = machinePlans.filter(plan => plan.status === 'in-progress');
                const waitingPlans = machinePlans.filter(plan => plan.status === 'waiting');

                return (
                  <Card key={machine} className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{machine}</CardTitle>
                      <div className="flex gap-2 text-sm text-gray-600">
                        <span>Devam Eden: {inProgressPlans.length}</span>
                        <span>•</span>
                        <span>Bekleyen: {waitingPlans.length}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* In Progress Section */}
                      {inProgressPlans.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-yellow-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            Devam Eden İşler
                          </div>
                          {inProgressPlans.map((plan) => (
                            <div key={plan.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{plan.productName}</h4>
                                  <p className="text-sm text-gray-600">Miktar: {plan.quantity}</p>
                                  <p className="text-xs text-gray-500">
                                    Başlatan: {plan.startedBy} • {plan.startedAt}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={plan.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                    {plan.priority === 'urgent' ? '🔥 Acil' : '📋 Normal'}
                                  </Badge>
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    🔄 Devam Ediyor
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleCompleteProduction(plan.id)}
                                  className="flex-1"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Onayla
                                </Button>
                                {(currentUser.role === 'admin' || currentUser.role === 'yönetici') && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleTogglePriority(plan.id)}
                                    >
                                      {plan.priority === 'urgent' ? '📋' : '🔥'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeletePlan(plan.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Separator */}
                      {inProgressPlans.length > 0 && waitingPlans.length > 0 && (
                        <div className="relative">
                          <Separator />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-white px-2 text-xs text-gray-500">Bekleyen İşler</span>
                          </div>
                        </div>
                      )}

                      {/* Waiting Section */}
                      {waitingPlans.length > 0 && (
                        <div className="space-y-3">
                          {inProgressPlans.length === 0 && (
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Bekleyen İşler
                            </div>
                          )}
                          {waitingPlans.map((plan) => (
                            <div key={plan.id} className="bg-white border rounded-lg p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{plan.productName}</h4>
                                  <p className="text-sm text-gray-600">Miktar: {plan.quantity}</p>
                                  <p className="text-xs text-gray-500">
                                    Oluşturan: {plan.createdBy} • {plan.createdAt}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={plan.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                    {plan.priority === 'urgent' ? '🔥 Acil' : '📋 Normal'}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    Bekliyor
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleStartProduction(plan.id)}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Başla
                                </Button>
                                {(currentUser.role === 'admin' || currentUser.role === 'yönetici') && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleTogglePriority(plan.id)}
                                    >
                                      {plan.priority === 'urgent' ? '📋' : '🔥'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeletePlan(plan.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {machinePlans.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Henüz plan yok</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Biten İşler</CardTitle>
                    <CardDescription>Tamamlanan üretim planları</CardDescription>
                  </div>
                  <Button onClick={exportToExcel} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Excel'e Aktar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {completedWork.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ürün Adı</TableHead>
                          <TableHead>Miktar</TableHead>
                          <TableHead>Makine</TableHead>
                          <TableHead>Oluşturan</TableHead>
                          <TableHead>Oluşturma Tarihi</TableHead>
                          <TableHead>Başlatan</TableHead>
                          <TableHead>Başlama Zamanı</TableHead>
                          <TableHead>Tamamlayan</TableHead>
                          <TableHead>Tamamlanma Tarihi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedWork.map((work) => (
                          <TableRow key={work.id}>
                            <TableCell className="font-medium">{work.productName}</TableCell>
                            <TableCell>{work.quantity}</TableCell>
                            <TableCell>{work.machine}</TableCell>
                            <TableCell>{work.createdBy}</TableCell>
                            <TableCell>{work.createdAt}</TableCell>
                            <TableCell>{work.startedBy || '-'}</TableCell>
                            <TableCell>{work.startedAt || '-'}</TableCell>
                            <TableCell>{work.completedBy}</TableCell>
                            <TableCell>{work.completedAt}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz tamamlanan iş yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {currentUser.role === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Kullanıcı Yönetimi</CardTitle>
                      <CardDescription>Sistem kullanıcılarını yönetin</CardDescription>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Kullanıcı Ekle
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                          <DialogDescription>
                            Sisteme yeni bir kullanıcı ekleyin.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser}>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-username">Kullanıcı Adı</Label>
                              <Input
                                id="new-username"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-password">Şifre</Label>
                              <Input
                                id="new-password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-role">Rol</Label>
                              <Select value={newUser.role} onValueChange={(value: 'user' | 'yönetici' | 'admin') => setNewUser({ ...newUser, role: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Kullanıcı</SelectItem>
                                  <SelectItem value="yönetici">Yönetici</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Kullanıcı Ekle</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kullanıcı Adı</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(user.role)}
                                {user.username}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog open={isEditUserOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                                  setIsEditUserOpen(open);
                                  if (!open) setEditingUser(null);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingUser({ ...user })}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                                      <DialogDescription>
                                        Kullanıcı bilgilerini güncelleyin.
                                      </DialogDescription>
                                    </DialogHeader>
                                    {editingUser && (
                                      <form onSubmit={handleEditUser}>
                                        <div className="grid gap-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-username">Kullanıcı Adı</Label>
                                            <Input
                                              id="edit-username"
                                              value={editingUser.username}
                                              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-password">Şifre</Label>
                                            <Input
                                              id="edit-password"
                                              type="password"
                                              value={editingUser.password}
                                              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-role">Rol</Label>
                                            <Select value={editingUser.role} onValueChange={(value: 'user' | 'yönetici' | 'admin') => setEditingUser({ ...editingUser, role: value })}>
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="user">Kullanıcı</SelectItem>
                                                <SelectItem value="yönetici">Yönetici</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button type="submit">Güncelle</Button>
                                        </DialogFooter>
                                      </form>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={currentUser.id === user.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}

export default App;