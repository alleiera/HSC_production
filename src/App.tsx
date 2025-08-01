import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Calendar, Download, LogOut, Plus, CheckCircle, Users, Settings, UserPlus, Trash2, Edit } from "lucide-react";

const initialUsers = [
  { username: "admin1", password: "1234", role: "admin" },
  { username: "yönetici1", password: "1234", role: "yönetici" },
  { username: "kullanici1", password: "1234", role: "user" },
];

const hatlar = [
  { id: "hat1", name: "Hat 1", color: "bg-blue-100 text-blue-800" },
  { id: "hat2", name: "Hat 2", color: "bg-green-100 text-green-800" },
  { id: "hat3", name: "Hat 3", color: "bg-purple-100 text-purple-800" },
];

const priorityConfig = {
  urgent: { label: "Acil", color: "bg-red-100 text-red-800 border-red-200", icon: "🔥" },
  normal: { label: "Normal", color: "bg-gray-100 text-gray-800 border-gray-200", icon: "📋" }
};
export default function App() {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("users");
    return savedUsers ? JSON.parse(savedUsers) : initialUsers;
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("planlar");
  const [plans, setPlans] = useState(() => {
    const savedPlans = localStorage.getItem("plans");
    return savedPlans ? JSON.parse(savedPlans) : [];
  });
  const [done, setDone] = useState(() => {
    const savedDone = localStorage.getItem("done");
    return savedDone ? JSON.parse(savedDone) : [];
  });
  const [popup, setPopup] = useState(null);
  const [userManagementPopup, setUserManagementPopup] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("plans", JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem("done", JSON.stringify(done));
  }, [done]);

  const login = (username, password) => {
    if (!username || !password) {
      toast({
        title: "Hata",
        description: "Lütfen kullanıcı adı ve şifre girin.",
        variant: "destructive",
      });
      return;
    }

    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      setCurrentUser(found);
      toast({
        title: "Başarılı",
        description: `Hoş geldiniz, ${found.username}!`,
      });
    } else {
      toast({
        title: "Hata",
        description: "Hatalı kullanıcı adı veya şifre.",
        variant: "destructive",
      });
    }
  };

  const confirmApproval = () => {
    const qty = Number(popup?.amount);
    if (!qty || qty <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir miktar girin.",
        variant: "destructive",
      });
      return;
    }

    const completedWork = {
      ...popup.plan,
      quantity: qty,
      approvedBy: currentUser.username,
      approvedAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    setDone(prev => [...prev, completedWork]);
    setPlans(prev => prev.filter(p => p.id !== popup.plan.id));
    setPopup(null);
    
    toast({
      title: "Başarılı",
      description: "İş başarıyla onaylandı.",
    });
  };

  const downloadExcel = () => {
    if (done.length === 0) {
      toast({
        title: "Bilgi",
        description: "İndirilecek veri bulunmuyor.",
      });
      return;
    }

    const header = "Makine\tÜrün\tParti\tTarih\tMiktar\tOnaylayan\tOnay Tarihi\n";
    const rows = done.map(p => 
      `${p.machine}\t${p.product}\t${p.batch}\t${p.date}\t${p.quantity}\t${p.approvedBy}\t${new Date(p.approvedAt).toLocaleString()}`
    ).join("\n");
    const csv = "\uFEFF" + header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bitirilen_isler_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Başarılı",
      description: "Excel dosyası indirildi.",
    });
  };

  const addUser = (newUser) => {
    if (users.find(u => u.username === newUser.username)) {
      toast({
        title: "Hata",
        description: "Bu kullanıcı adı zaten mevcut.",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => [...prev, newUser]);
    setUserManagementPopup(null);
    toast({
      title: "Başarılı",
      description: "Yeni kullanıcı eklendi.",
    });
  };

  const deleteUser = (username) => {
    if (username === currentUser.username) {
      toast({
        title: "Hata",
        description: "Kendi hesabınızı silemezsiniz.",
        variant: "destructive",
      });
      return;
    }

    setUsers(prev => prev.filter(u => u.username !== username));
    toast({
      title: "Başarılı",
      description: "Kullanıcı silindi.",
    });
  };

  const updateUser = (updatedUser) => {
    setUsers(prev => prev.map(u => 
      u.username === updatedUser.originalUsername ? 
      { ...updatedUser, username: updatedUser.username || updatedUser.originalUsername } : 
      u
    ));
    setUserManagementPopup(null);
    toast({
      title: "Başarılı",
      description: "Kullanıcı güncellendi.",
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "yönetici": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Üretim Yönetimi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kullanıcı Adı</label>
              <Input 
                placeholder="Kullanıcı adınızı girin"
                value={loginForm.username}
                onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                onKeyPress={e => e.key === 'Enter' && login(loginForm.username, loginForm.password)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <Input 
                type="password"
                placeholder="Şifrenizi girin"
                value={loginForm.password}
                onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                onKeyPress={e => e.key === 'Enter' && login(loginForm.username, loginForm.password)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => login(loginForm.username, loginForm.password)}
            >
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Üretim</h1>
              <p className="text-sm text-gray-500">Yönetim Sistemi</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium">{currentUser.username}</p>
              <Badge variant="secondary" className={getRoleColor(currentUser.role)}>
                {currentUser.role}
              </Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant={activeTab === "planlar" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("planlar")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Üretim Planları
          </Button>
          <Button 
            variant={activeTab === "bitmis" ? "default" : "ghost"}
            className="w-full justify-start" 
            onClick={() => setActiveTab("bitmis")}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Biten İşler
          </Button>
          {currentUser.role === "admin" && (
            <Button 
              variant={activeTab === "kullanicilar" ? "default" : "ghost"}
              className="w-full justify-start" 
              onClick={() => setActiveTab("kullanicilar")}
            >
              <Users className="w-4 h-4 mr-2" />
              Kullanıcı Yönetimi
            </Button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setCurrentUser(null);
              setLoginForm({ username: "", password: "" });
              toast({
                title: "Bilgi",
                description: "Başarıyla çıkış yapıldı.",
              });
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === "planlar" ? "Üretim Planları" : 
               activeTab === "bitmis" ? "Biten İşler" : "Kullanıcı Yönetimi"}
            </h2>
            {activeTab === "bitmis" && done.length > 0 && (
              <Button onClick={downloadExcel} className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Excel İndir</span>
              </Button>
            )}
            {activeTab === "kullanicilar" && currentUser.role === "admin" && (
              <Button 
                onClick={() => setUserManagementPopup({ type: "add", user: { username: "", password: "", role: "user" } })}
                className="flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Yeni Kullanıcı</span>
              </Button>
            )}
          </div>

          {activeTab === "planlar" && (
            <div className="space-y-6">
              {(currentUser.role === "admin" || currentUser.role === "yönetici") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="w-5 h-5" />
                      <span>Yeni Plan Ekle</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PlanForm hatlar={hatlar} onAdd={p => {
                      const newPlan = { ...p, id: Date.now().toString() };
                      setPlans(prev => [...prev, newPlan]);
                      toast({
                        title: "Başarılı",
                        description: "Yeni plan eklendi.",
                      });
                    }} />
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {hatlar.map(hat => (
                  <Card key={hat.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{hat.name}</span>
                        <Badge className={hat.color}>
                          {plans.filter(p => p.machine === hat.name).length} Plan
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {plans.filter(p => p.machine === hat.name).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Henüz plan bulunmuyor</p>
                        </div>
                      ) : (
                        plans
                          .filter(p => p.machine === hat.name)
                          .sort((a, b) => {
                            // Urgent items first
                            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                            if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
                            return 0;
                          })
                          .map((plan, i) => (
                          <div key={i} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{plan.product}</h4>
                                  <Badge className={`text-xs ${priorityConfig[plan.priority || 'normal'].color}`}>
                                    {priorityConfig[plan.priority || 'normal'].icon} {priorityConfig[plan.priority || 'normal'].label}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p>Parti: {plan.batch}</p>
                                  <p>Tarih: {plan.date}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-2">
                                {(currentUser.role === "admin" || currentUser.role === "yönetici") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newPriority = plan.priority === 'urgent' ? 'normal' : 'urgent';
                                      setPlans(prev => prev.map(p => 
                                        p.id === plan.id ? { ...p, priority: newPriority } : p
                                      ));
                                      toast({
                                        title: "Başarılı",
                                        description: `Öncelik ${priorityConfig[newPriority].label} olarak değiştirildi.`,
                                      });
                                    }}
                                    className={plan.priority === 'urgent' ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}
                                  >
                                    {plan.priority === 'urgent' ? '⬇️ Normal' : '⬆️ Acil'}
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  onClick={() => setPopup({ plan, amount: "" })}
                                  className={plan.priority === 'urgent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                  Onayla
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "kullanicilar" && currentUser.role === "admin" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-semibold">Kullanıcı Adı</th>
                        <th className="text-left p-4 font-semibold">Rol</th>
                        <th className="text-left p-4 font-semibold">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{user.username}</td>
                          <td className="p-4">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setUserManagementPopup({ 
                                  type: "edit", 
                                  user: { ...user, originalUsername: user.username } 
                                })}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {user.username !== currentUser.username && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteUser(user.username)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "bitmis" && (
            <Card>
              <CardContent className="p-0">
                {done.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Henüz bitirilen iş bulunmuyor</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-4 font-semibold">Makine</th>
                          <th className="text-left p-4 font-semibold">Ürün</th>
                          <th className="text-left p-4 font-semibold">Parti</th>
                          <th className="text-left p-4 font-semibold">Tarih</th>
                          <th className="text-left p-4 font-semibold">Miktar</th>
                          <th className="text-left p-4 font-semibold">Onaylayan</th>
                          <th className="text-left p-4 font-semibold">Onay Tarihi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {done.map((p, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <Badge variant="outline">
                                {p.machine}
                              </Badge>
                            </td>
                            <td className="p-4 font-medium">{p.product}</td>
                            <td className="p-4">{p.batch}</td>
                            <td className="p-4">{p.date}</td>
                            <td className="p-4">
                              <Badge variant="secondary">
                                {p.quantity}
                              </Badge>
                            </td>
                            <td className="p-4">{p.approvedBy}</td>
                            <td className="p-4 text-sm text-gray-500">
                              {new Date(p.approvedAt).toLocaleString('tr-TR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={!!popup} onOpenChange={() => setPopup(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Üretim Onayı</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">{popup?.plan?.product}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Makine: {popup?.plan?.machine}</p>
                <p>Parti: {popup?.plan?.batch}</p>
                <p>Tarih: {popup?.plan?.date}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Üretilen Miktar</label>
              <Input
                type="number"
                placeholder="Miktar girin"
                value={popup?.amount || ""}
                onChange={e => setPopup(p => ({ ...p, amount: e.target.value }))}
                onKeyPress={e => e.key === 'Enter' && confirmApproval()}
              />
            </div>
            <Button className="w-full" onClick={confirmApproval}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Onayla ve Tamamla
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userManagementPopup} onOpenChange={() => setUserManagementPopup(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {userManagementPopup?.type === "add" ? "Yeni Kullanıcı Ekle" : "Kullanıcı Düzenle"}
            </DialogTitle>
          </DialogHeader>
          <UserForm 
            user={userManagementPopup?.user}
            onSubmit={userManagementPopup?.type === "add" ? addUser : updateUser}
            isEdit={userManagementPopup?.type === "edit"}
          />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

function PlanForm({ hatlar, onAdd }) {
  const [machine, setMachine] = useState(hatlar[0].name);
  const [product, setProduct] = useState("");
  const [batch, setBatch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState("normal");

  const handleAdd = () => {
    if (!product.trim() || !batch.trim() || !date) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }
    
    onAdd({ machine, product: product.trim(), batch: batch.trim(), date, priority });
    setProduct("");
    setBatch("");
    setDate(new Date().toISOString().split('T')[0]);
    setPriority("normal");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
      <div className="space-y-2">
        <label className="text-sm font-medium">Makine</label>
        <Select value={machine} onValueChange={setMachine}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hatlar.map(h => (
              <SelectItem key={h.id} value={h.name}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ürün</label>
        <Input 
          placeholder="Ürün adı" 
          value={product} 
          onChange={e => setProduct(e.target.value)} 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Parti</label>
        <Input 
          placeholder="Parti no" 
          value={batch} 
          onChange={e => setBatch(e.target.value)} 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tarih</label>
        <Input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Öncelik</label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span>Normal</span>
              </div>
            </SelectItem>
            <SelectItem value="urgent">
              <div className="flex items-center gap-2">
                <span>🔥</span>
                <span>Acil</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAdd} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Ekle
      </Button>
    </div>
  );
}

function UserForm({ user, onSubmit, isEdit }) {
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "user");

  const handleSubmit = () => {
    if (!username.trim()) {
      toast({
        title: "Hata",
        description: "Kullanıcı adı gereklidir.",
        variant: "destructive",
      });
      return;
    }

    if (!isEdit && !password.trim()) {
      toast({
        title: "Hata",
        description: "Şifre gereklidir.",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      username: username.trim(),
      role,
      ...(isEdit && { originalUsername: user.originalUsername }),
      ...(password.trim() && { password: password.trim() }),
      ...(!password.trim() && isEdit && { password: user.password }),
    };

    onSubmit(userData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Kullanıcı Adı</label>
        <Input
          placeholder="Kullanıcı adı girin"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Şifre {isEdit && <span className="text-gray-500">(boş bırakılırsa değişmez)</span>}
        </label>
        <Input
          type="password"
          placeholder={isEdit ? "Yeni şifre (opsiyonel)" : "Şifre girin"}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Rol</label>
        <Select value={role} onValueChange={setRole}>
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

      <Button className="w-full" onClick={handleSubmit}>
        <UserPlus className="w-4 h-4 mr-2" />
        {isEdit ? "Güncelle" : "Kullanıcı Ekle"}
      </Button>
    </div>
  );
}