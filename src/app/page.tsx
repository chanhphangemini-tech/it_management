'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Package,
  Mail,
  Network,
  ChevronRight,
  Phone,
  Clock,
  Server,
  FileText,
  Lightbulb,
  Briefcase,
  Shield,
  CalendarCheck,
  Settings,
  Bell,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AssetManagement } from '@/components/assets/asset-management'
import ITHandbook from '@/components/it-handbook'
import EmailTemplates from '@/components/email-templates'
import NetworkManager from '@/components/network-manager'

// Menu items for sidebar
const menuItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'handbook', label: 'Sổ tay IT', icon: BookOpen },
  { id: 'assets', label: 'Tài sản', icon: Package },
  { id: 'email', label: 'Mẫu Email', icon: Mail },
  { id: 'network', label: 'Quản lý mạng', icon: Network },
]

// Workflow columns data
const workflowColumns = [
  {
    id: 'reaction',
    title: 'Phản Ứng Nhanh',
    color: 'rose',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    headerBg: 'bg-rose-500',
    items: [
      { id: 'sla', title: 'Phản hồi SLA', icon: Clock, description: 'Theo dõi thời gian phản hồi' },
      { id: 'hotline', title: 'Hỗ trợ đường dây nóng', icon: Phone, description: 'Hỗ trợ qua đường dây nóng' },
    ],
  },
  {
    id: 'operation',
    title: 'Vận Hành Hệ Thống',
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    headerBg: 'bg-amber-500',
    items: [
      { id: 'infrastructure', title: 'Hạ Tầng', icon: Server, description: 'Quản lý hạ tầng IT' },
      { id: 'logs', title: 'Theo dõi nhật ký', icon: FileText, description: 'Theo dõi nhật ký hệ thống' },
    ],
  },
  {
    id: 'solution',
    title: 'Giải Pháp SME',
    color: 'emerald',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    headerBg: 'bg-emerald-500',
    items: [
      { id: 'presale', title: 'Bán hàng trước', icon: Lightbulb, description: 'Hỗ trợ bán hàng kỹ thuật' },
      { id: 'biz', title: 'Business', icon: Briefcase, description: 'Giải pháp kinh doanh' },
    ],
  },
  {
    id: 'security',
    title: 'Bảo Trì & An Ninh',
    color: 'slate',
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    borderColor: 'border-slate-200 dark:border-slate-800',
    headerBg: 'bg-slate-500',
    items: [
      { id: 'periodic', title: 'Công việc định kỳ', icon: CalendarCheck, description: 'Công việc định kỳ' },
      { id: 'security', title: 'An ninh mạng', icon: Shield, description: 'An ninh mạng' },
    ],
  },
]

// Dashboard Content Component
function DashboardContent() {
  return (
    <>
      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-24 md:h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 md:-mt-16">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-background shadow-lg">
              <AvatarImage src="/avatar.png" alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-amber-500 text-white text-2xl">
                PMC
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2 sm:pt-0 sm:pb-2">
              <h3 className="text-xl md:text-2xl font-bold">Phan Minh Chánh</h3>
              <p className="text-muted-foreground">Quản Trị Hệ Thống</p>
            </div>
            <div className="flex gap-2 pb-2">
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900 dark:text-rose-300">
                Admin
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300">
                IT Support
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1 p-1 bg-muted/50">
          <TabsTrigger value="workflow" className="data-[state=active]:bg-background">
            Quy trình
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-background">
            Nhiệm vụ
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-background">
            Báo cáo
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-background">
            Cài đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="mt-0">
          {/* Workflow Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowColumns.map((column) => (
              <Card
                key={column.id}
                className={cn(
                  'overflow-hidden border-t-4 transition-all hover:shadow-lg',
                  column.borderColor,
                  column.bgColor
                )}
              >
                {/* Column Header */}
                <div className={cn('px-4 py-3 text-white', column.headerBg)}>
                  <h3 className="font-semibold text-sm md:text-base">{column.title}</h3>
                </div>

                {/* Column Content */}
                <CardContent className="p-3 space-y-2">
                  {column.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'p-3 rounded-lg bg-background/80 border cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]',
                          'active:scale-[0.98]'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'p-2 rounded-lg',
                              column.id === 'reaction' && 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300',
                              column.id === 'operation' && 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300',
                              column.id === 'solution' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300',
                              column.id === 'security' && 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Nhiệm vụ</CardTitle>
              <CardDescription>Quản lý công việc của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Nội dung Nhiệm vụ sẽ được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo</CardTitle>
              <CardDescription>Báo cáo và thống kê</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Nội dung Báo cáo sẽ được phát triển</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt</CardTitle>
              <CardDescription>Cài đặt hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Nhập dữ liệu mẫu</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Nhấn nút bên dưới để nhập dữ liệu mẫu vào cơ sở dữ liệu. Điều này sẽ thêm người dùng, danh mục, cases, worklogs, mẫu email và thiết bị mạng.
                </p>
                <Button 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/seed', { method: 'POST' })
                      const data = await res.json()
                      alert(data.message || JSON.stringify(data))
                    } catch (err) {
                      alert('Error: ' + err)
                    }
                  }}
                >
                  Nhập dữ liệu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Cuộc gọi Hotline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Máy chủ hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Giải pháp</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-xs text-muted-foreground">Thời gian hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Get page title based on active menu
function getPageTitle(activeMenu: string) {
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Tổng quan', subtitle: 'Quản trị hệ thống IT' },
    handbook: { title: 'Sổ tay IT', subtitle: 'Hướng dẫn và tài liệu IT' },
    assets: { title: 'Tài sản', subtitle: 'Quản lý tài sản công ty' },
    email: { title: 'Mẫu Email', subtitle: 'Quản lý mẫu email' },
    network: { title: 'Quản lý mạng', subtitle: 'Quản lý thiết bị mạng' },
  }
  return titles[activeMenu] || { title: 'Tổng quan', subtitle: 'Quản trị hệ thống IT' }
}

// Main Dashboard Component
export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pageInfo = getPageTitle(activeMenu)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <span className="font-semibold text-lg">Chánh Phan IT</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">CP</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Chánh Phan</h1>
              <p className="text-xs text-muted-foreground">IT Tools</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-11',
                  isActive && 'bg-secondary font-medium'
                )}
                onClick={() => {
                  setActiveMenu(item.id)
                  setSidebarOpen(false)
                }}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span>Version 1.0.0</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">© 2024 Chánh Phan IT</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <h2 className="text-xl font-semibold">{pageInfo.title}</h2>
                <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </Button>
              <div className="flex items-center gap-3 pl-3 border-l">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">Phan Minh Chánh</p>
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                    Online
                  </Badge>
                </div>
                <Avatar>
                  <AvatarImage src="/avatar.png" alt="Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-amber-500 text-white">
                    PMC
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 space-y-6">
            {activeMenu === 'dashboard' && <DashboardContent />}
            {activeMenu === 'assets' && <AssetManagement />}
            {activeMenu === 'handbook' && <ITHandbook />}
            {activeMenu === 'email' && <EmailTemplates />}
            {activeMenu === 'network' && <NetworkManager />}
          </div>
        </ScrollArea>

        {/* Footer */}
        <footer className="border-t bg-card/80 backdrop-blur-sm mt-auto">
          <div className="px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>© 2024 Chánh Phan IT Tools. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống trực tuyến
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
