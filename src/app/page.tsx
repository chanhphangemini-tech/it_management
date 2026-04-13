'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Menu,
  MonitorDot,
  Pencil,
  Plus,
  Trash2,
  GripVertical,
  X,
  Target,
  Save,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { AssetManagement } from '@/components/assets/asset-management'
import ITHandbook from '@/components/it-handbook'
import EmailTemplates from '@/components/email-templates'
import NetworkManager from '@/components/network-manager'

// ==================== Types ====================

interface WorkflowItem {
  id?: number
  title: string
  description?: string | null
  timeEstimate?: string | null
  sortOrder: number
}

interface WorkflowColumn {
  id: number
  title: string
  subtitle: string
  description?: string | null
  color: string
  target?: string | null
  sortOrder: number
  items: WorkflowItem[]
}

// ==================== Color Mapping ====================

const colorConfig: Record<string, {
  headerBg: string
  bgColor: string
  borderColor: string
  itemIconBg: string
  dotColor: string
  label: string
}> = {
  rose: {
    headerBg: 'bg-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    itemIconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300',
    dotColor: 'bg-rose-500',
    label: 'Hồng (Rose)',
  },
  amber: {
    headerBg: 'bg-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    itemIconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300',
    dotColor: 'bg-amber-500',
    label: 'Vàng (Amber)',
  },
  emerald: {
    headerBg: 'bg-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    itemIconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
    label: 'Xanh lá (Emerald)',
  },
  slate: {
    headerBg: 'bg-slate-500',
    bgColor: 'bg-slate-50 dark:bg-slate-950/30',
    borderColor: 'border-slate-200 dark:border-slate-800',
    itemIconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300',
    dotColor: 'bg-slate-500',
    label: 'Xám (Slate)',
  },
  sky: {
    headerBg: 'bg-sky-500',
    bgColor: 'bg-sky-50 dark:bg-sky-950/30',
    borderColor: 'border-sky-200 dark:border-sky-800',
    itemIconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300',
    dotColor: 'bg-sky-500',
    label: 'Xanh dương (Sky)',
  },
  violet: {
    headerBg: 'bg-violet-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-800',
    itemIconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300',
    dotColor: 'bg-violet-500',
    label: 'Tím (Violet)',
  },
}

function getColorClasses(color: string) {
  return colorConfig[color] || colorConfig.slate
}

// ==================== Column Form State ====================

interface ColumnFormData {
  title: string
  subtitle: string
  description: string
  color: string
  target: string
  items: WorkflowItem[]
}

function emptyColumnForm(): ColumnFormData {
  return {
    title: '',
    subtitle: '',
    description: '',
    color: 'slate',
    target: '',
    items: [],
  }
}

function columnToForm(col: WorkflowColumn): ColumnFormData {
  return {
    title: col.title,
    subtitle: col.subtitle,
    description: col.description || '',
    color: col.color,
    target: col.target || '',
    items: col.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      timeEstimate: item.timeEstimate || '',
      sortOrder: item.sortOrder,
    })),
  }
}

function emptyItem(): WorkflowItem {
  return { title: '', description: '', timeEstimate: '', sortOrder: 0 }
}

// ==================== Menu items for sidebar ====================

const menuItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'handbook', label: 'Sổ tay IT', icon: BookOpen },
  { id: 'assets', label: 'Tài sản', icon: Package },
  { id: 'email', label: 'Mẫu Email', icon: Mail },
  { id: 'network', label: 'Quản lý mạng', icon: Network },
]

// ==================== Quick stats with live data fetching ====================

function QuickStats() {
  const [stats, setStats] = useState({ cases: 0, worklogs: 0, assets: 0, devices: 0 })

  useEffect(() => {
    async function loadStats() {
      try {
        const [casesRes, worklogsRes, assetsRes, devicesRes] = await Promise.all([
          fetch('/api/cases?limit=1').then(r => r.json()).catch(() => ({ pagination: { total: 0 } })),
          fetch('/api/worklogs?limit=1').then(r => r.json()).catch(() => ({ pagination: { total: 0 } })),
          fetch('/api/assets?limit=1').then(r => r.json()).catch(() => ({ pagination: { total: 0 } })),
          fetch('/api/net-devices?limit=1').then(r => r.json()).catch(() => ({ pagination: { total: 0 } })),
        ])
        setStats({
          cases: casesRes.pagination?.total || 0,
          worklogs: worklogsRes.pagination?.total || 0,
          assets: assetsRes.pagination?.total || 0,
          devices: devicesRes.pagination?.total || 0,
        })
      } catch {
        // silently fail
      }
    }
    loadStats()
  }, [])

  const statCards = [
    { label: 'Cases', value: stats.cases, icon: FileText, color: 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300' },
    { label: 'Worklogs', value: stats.worklogs, icon: Clock, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' },
    { label: 'Tài sản', value: stats.assets, icon: Package, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' },
    { label: 'Thiết bị mạng', value: stats.devices, icon: MonitorDot, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statCards.map((s) => {
        const Icon = s.icon
        return (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', s.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ==================== Workflow Column Card (Display) ====================

function WorkflowColumnCard({ column }: { column: WorkflowColumn }) {
  const colors = getColorClasses(column.color)

  return (
    <Card
      className={cn(
        'overflow-hidden border-t-4 transition-all hover:shadow-md',
        colors.borderColor,
        colors.bgColor
      )}
    >
      <div className={cn('px-4 py-2.5 text-white', colors.headerBg)}>
        <h4 className="font-semibold text-sm leading-tight">{column.title}</h4>
        {column.subtitle && (
          <p className="text-xs text-white/80 mt-0.5">{column.subtitle}</p>
        )}
      </div>
      {column.target && (
        <div className="px-3 py-1.5 bg-background/60 border-b">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="h-3 w-3" />
            {column.target}
          </p>
        </div>
      )}
      <CardContent className="p-3 space-y-2">
        {column.items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-background/80 border cursor-pointer transition-all hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg shrink-0', colors.itemIconBg)}>
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm">{item.title}</h5>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                )}
                {item.timeEstimate && (
                  <Badge variant="outline" className="mt-1.5 text-[10px] px-1.5 py-0">
                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                    {item.timeEstimate}
                  </Badge>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
        {column.items.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">Chưa có mục nào</p>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== Edit Item Row ====================

function EditItemRow({
  item,
  index,
  color,
  onChange,
  onRemove,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  item: WorkflowItem
  index: number
  color: string
  onChange: (updated: WorkflowItem) => void
  onRemove: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const colors = getColorClasses(color)

  return (
    <div className={cn('rounded-lg border p-3 space-y-2', colors.borderColor, colors.bgColor)}>
      <div className="flex items-center gap-2">
        <div className={cn('p-1.5 rounded', colors.itemIconBg)}>
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <Input
          placeholder="Tiêu đề mục"
          value={item.title}
          onChange={(e) => onChange({ ...item, title: e.target.value })}
          className="h-8 text-sm"
        />
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            disabled={!canMoveUp}
            onClick={onMoveUp}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            disabled={!canMoveDown}
            onClick={onMoveDown}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        placeholder="Mô tả (tuỳ chọn)"
        value={item.description || ''}
        onChange={(e) => onChange({ ...item, description: e.target.value })}
        className="text-sm min-h-[60px] resize-none"
        rows={2}
      />
      <Input
        placeholder="Thời gian ước tính (VD: 1-2h/ngày)"
        value={item.timeEstimate || ''}
        onChange={(e) => onChange({ ...item, timeEstimate: e.target.value })}
        className="h-8 text-sm"
      />
    </div>
  )
}

// ==================== Column Edit Dialog ====================

function WorkflowEditDialog({
  open,
  onOpenChange,
  columns,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: WorkflowColumn[]
  onSaved: () => void
}) {
  // Mode: 'list' | 'edit' | 'new'
  const [mode, setMode] = useState<'list' | 'edit' | 'new'>('list')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ColumnFormData>(emptyColumnForm())
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const resetAndClose = () => {
    setMode('list')
    setEditingId(null)
    setForm(emptyColumnForm())
    setError('')
    onOpenChange(false)
  }

  const handleOpenDialog = () => {
    setMode('list')
    setEditingId(null)
    setForm(emptyColumnForm())
    setError('')
  }

  const handleEditColumn = (col: WorkflowColumn) => {
    setEditingId(col.id)
    setForm(columnToForm(col))
    setMode('edit')
  }

  const handleNewColumn = () => {
    setEditingId(null)
    setForm(emptyColumnForm())
    setMode('new')
  }

  const handleBackToList = () => {
    setMode('list')
    setEditingId(null)
    setForm(emptyColumnForm())
    setError('')
  }

  const handleFormChange = (field: keyof ColumnFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, updated: WorkflowItem) => {
    setForm((prev) => {
      const items = [...prev.items]
      items[index] = updated
      return { ...prev, items }
    })
  }

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem(), sortOrder: prev.items.length }],
    }))
  }

  const handleRemoveItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sortOrder: i })),
    }))
  }

  const handleMoveItemUp = (index: number) => {
    if (index === 0) return
    setForm((prev) => {
      const items = [...prev.items]
      ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
      return { ...prev, items: items.map((item, i) => ({ ...item, sortOrder: i })) }
    })
  }

  const handleMoveItemDown = (index: number) => {
    if (index >= form.items.length - 1) return
    setForm((prev) => {
      const items = [...prev.items]
      ;[items[index], items[index + 1]] = [items[index + 1], items[index]]
      return { ...prev, items: items.map((item, i) => ({ ...item, sortOrder: i })) }
    })
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.subtitle.trim()) {
      setError('Tiêu đề và tên phụ là bắt buộc')
      return
    }
    if (form.items.some((item) => !item.title.trim())) {
      setError('Tất cả các mục phải có tiêu đề')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim() || null,
        color: form.color,
        target: form.target.trim() || null,
        items: form.items.map((item) => ({
          id: item.id,
          title: item.title.trim(),
          description: item.description?.trim() || null,
          timeEstimate: item.timeEstimate?.trim() || null,
          sortOrder: item.sortOrder,
        })),
      }

      if (mode === 'new') {
        const res = await fetch('/api/workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Không thể tạo')
      } else if (mode === 'edit' && editingId) {
        const res = await fetch(`/api/workflow/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Không thể cập nhật')
      }

      onSaved()
      handleBackToList()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/workflow/${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Không thể xóa')
      onSaved()
      setDeleteId(null)
    } catch {
      // silently fail
    }
  }

  const colors = getColorClasses(form.color)

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose() }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {mode === 'list' && (
            <>
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Quản lý Quy trình làm việc
                </DialogTitle>
                <DialogDescription>
                  Thêm, chỉnh sửa hoặc xóa các cột quy trình làm việc
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 pb-4">
                <div className="space-y-3">
                  {columns.map((col) => {
                    const c = getColorClasses(col.color)
                    return (
                      <div
                        key={col.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm',
                          c.bgColor,
                          c.borderColor
                        )}
                        onClick={() => handleEditColumn(col)}
                      >
                        <div className={cn('w-3 h-3 rounded-full shrink-0', c.dotColor)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{col.title}</p>
                          <p className="text-xs text-muted-foreground">{col.subtitle} • {col.items.length} mục</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleEditColumn(col) }}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(col.id) }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                  {columns.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có cột nào</p>
                  )}
                </div>
              </div>
              <div className="p-4 border-t">
                <Button onClick={handleNewColumn} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm cột mới
                </Button>
              </div>
            </>
          )}

          {(mode === 'edit' || mode === 'new') && (
            <>
              <DialogHeader className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToList}>
                    <X className="h-4 w-4" />
                  </Button>
                  <DialogTitle>
                    {mode === 'new' ? 'Thêm cột mới' : 'Chỉnh sửa cột'}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  {mode === 'new' ? 'Tạo cột quy trình làm việc mới' : `Đang sửa: ${columns.find(c => c.id === editingId)?.title}`}
                </DialogDescription>
              </DialogHeader>

              {error && (
                <div className="px-6 pb-2">
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
                {/* Column Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Tiêu đề <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="VD: SLA & HOTLINE"
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Tên phụ <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="VD: Phản Ứng Nhanh"
                      value={form.subtitle}
                      onChange={(e) => handleFormChange('subtitle', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Mô tả</Label>
                  <Textarea
                    placeholder="Mô tả ngắn gọn về cột này"
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="min-h-[60px] resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Màu sắc</Label>
                    <Select value={form.color} onValueChange={(v) => handleFormChange('color', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(colorConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={cn('w-3 h-3 rounded-full', cfg.dotColor)} />
                              {cfg.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Mục tiêu</Label>
                    <Input
                      placeholder="VD: Xử lý 100% Ticket"
                      value={form.target}
                      onChange={(e) => handleFormChange('target', e.target.value)}
                    />
                  </div>
                </div>

                {/* Color preview */}
                <div className={cn('rounded-lg border-t-4 p-3', colors.borderColor, colors.bgColor)}>
                  <div className={cn('rounded-t px-3 py-2 text-white text-sm font-semibold -mx-3 -mt-3 mb-2', colors.headerBg)}>
                    {form.title || 'Tiêu đề'} {form.subtitle && <span className="text-white/80 font-normal">— {form.subtitle}</span>}
                  </div>
                  {form.target && (
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Target className="h-3 w-3" /> {form.target}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Các mục ({form.items.length})
                    </Label>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddItem}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Thêm mục
                    </Button>
                  </div>

                  {form.items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                      Chưa có mục nào. Nhấn &quot;Thêm mục&quot; để bắt đầu.
                    </p>
                  )}

                  {form.items.map((item, index) => (
                    <EditItemRow
                      key={index}
                      item={item}
                      index={index}
                      color={form.color}
                      onChange={(updated) => handleItemChange(index, updated)}
                      onRemove={() => handleRemoveItem(index)}
                      canMoveUp={index > 0}
                      canMoveDown={index < form.items.length - 1}
                      onMoveUp={() => handleMoveItemUp(index)}
                      onMoveDown={() => handleMoveItemDown(index)}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-between gap-2">
                <Button variant="outline" onClick={handleBackToList}>
                  Quay lại
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>Đang lưu...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      {mode === 'new' ? 'Tạo cột' : 'Lưu thay đổi'}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa cột này và tất cả các mục bên trong? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ==================== Dashboard Content Component ====================

function DashboardContent() {
  const [columns, setColumns] = useState<WorkflowColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const fetchColumns = useCallback(async () => {
    try {
      const res = await fetch('/api/workflow')
      const data = await res.json()
      if (data.success) {
        setColumns(data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchColumns()
  }, [fetchColumns])

  return (
    <>
      {/* Profile Card - compact */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 h-20 md:h-28" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 -mt-10 md:-mt-14">
            <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-background shadow-lg">
              <AvatarImage src="/avatar.png" alt="Avatar" />
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-amber-500 text-white text-2xl">
                PMC
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-1 sm:pt-0 sm:pb-2">
              <h3 className="text-xl md:text-2xl font-bold">Phan Minh Chánh</h3>
              <p className="text-muted-foreground text-sm">Quản Trị Hệ Thống</p>
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

      {/* Quick Stats - Live */}
      <QuickStats />

      {/* Workflow - Dynamic from DB */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          Quy trình làm việc
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs text-muted-foreground"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Chỉnh sửa
          </Button>
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-16" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : columns.length === 0 ? (
          <Card className="p-8 text-center">
            <LayoutDashboard className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Chưa có quy trình làm việc nào</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setEditOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm quy trình
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {columns.map((column) => (
              <WorkflowColumnCard key={column.id} column={column} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <WorkflowEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        columns={columns}
        onSaved={fetchColumns}
      />
    </>
  )
}

// ==================== Get page title based on active menu ====================

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

// ==================== Main Dashboard Component ====================

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pageInfo = getPageTitle(activeMenu)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CP</span>
          </div>
          <span className="font-semibold">Chánh Phan IT</span>
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
          'fixed md:static inset-y-0 left-0 z-50 w-60 bg-card border-r flex flex-col transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <div>
              <h1 className="font-bold leading-tight">Chánh Phan</h1>
              <p className="text-xs text-muted-foreground">IT Tools</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenu === item.id
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-10 text-sm',
                  isActive && 'bg-secondary font-medium'
                )}
                onClick={() => {
                  setActiveMenu(item.id)
                  setSidebarOpen(false)
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
              </Button>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t">
          <p className="text-xs text-muted-foreground">© 2026 Chánh Phan IT</p>
          <p className="text-xs text-muted-foreground">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold">{pageInfo.title}</h2>
              <p className="text-xs text-muted-foreground">{pageInfo.subtitle}</p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">Phan Minh Chánh</p>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  Online
                </Badge>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="Avatar" />
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-amber-500 text-white text-xs">
                  PMC
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 space-y-5">
            {activeMenu === 'dashboard' && <DashboardContent />}
            {activeMenu === 'assets' && <AssetManagement />}
            {activeMenu === 'handbook' && <ITHandbook />}
            {activeMenu === 'email' && <EmailTemplates />}
            {activeMenu === 'network' && <NetworkManager />}
          </div>
        </ScrollArea>

        {/* Footer */}
        <footer className="border-t bg-card/80 backdrop-blur-sm mt-auto">
          <div className="px-4 md:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-muted-foreground">
            <p>© 2026 Chánh Phan IT Tools. Bảo lưu mọi quyền.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
