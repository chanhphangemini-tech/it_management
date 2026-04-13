'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Code,
  FileText,
  Bell,
  Users,
  Briefcase,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Types
interface EmailTemplate {
  id: number
  name: string
  subject: string
  content: string
  category: string
  tags: string | null
  createdBy: number | null
  createdAt: string
  updatedAt: string
  creator?: {
    id: number
    username: string
    fullName: string | null
  } | null
}

// Category options with icons
const categoryOptions = [
  { value: 'general', label: 'Chung', icon: FileText, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { value: 'notification', label: 'Thông báo', icon: Bell, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  { value: 'marketing', label: 'Tiếp thị', icon: Users, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  { value: 'business', label: 'Kinh doanh', icon: Briefcase, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
  { value: 'alert', label: 'Cảnh báo', icon: AlertCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
]

// Get category config
const getCategoryConfig = (category: string) => {
  return categoryOptions.find(c => c.value === category) || categoryOptions[0]
}

// Parse tags from string
const parseTags = (tagsStr: string | null): string[] => {
  if (!tagsStr) return []
  try {
    const parsed = JSON.parse(tagsStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean)
  }
}

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function EmailTemplates() {
  // State
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general',
    tags: '',
  })

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }

      const response = await fetch(`/api/email-templates?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setTemplates(result.data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Filter templates by search query
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query) ||
      template.subject.toLowerCase().includes(query) ||
      parseTags(template.tags).some(tag => tag.toLowerCase().includes(query))
    )
  })

  // Open create dialog
  const openCreateDialog = () => {
    setIsEditing(false)
    setSelectedTemplate(null)
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'general',
      tags: '',
    })
    setFormOpen(true)
  }

  // Open edit dialog
  const openEditDialog = (template: EmailTemplate) => {
    setIsEditing(true)
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category,
      tags: parseTags(template.tags).join(', '),
    })
    setFormOpen(true)
  }

  // Open preview dialog
  const openPreviewDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setPreviewOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setDeleteOpen(true)
  }

  // Handle form submit
  const handleSubmit = async () => {
    if (!formData.name || !formData.subject || !formData.content) {
      return
    }

    setSaving(true)
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const payload = {
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        category: formData.category,
        tags: JSON.stringify(tagsArray),
      }

      let response
      if (isEditing && selectedTemplate) {
        response = await fetch(`/api/email-templates/${selectedTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      const result = await response.json()

      if (result.success) {
        setFormOpen(false)
        fetchTemplates()
      }
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedTemplate) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/email-templates/${selectedTemplate.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setDeleteOpen(false)
        fetchTemplates()
      }
    } catch (error) {
      console.error('Error deleting template:', error)
    } finally {
      setDeleting(false)
    }
  }

  // Handle copy to clipboard
  const handleCopy = (text: string, label: string, type?: 'subject' | 'content') => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}`)
    
    if (type === 'subject') {
      setCopiedSubject(true)
      setTimeout(() => setCopiedSubject(false), 2000)
    } else if (type === 'content') {
      setCopiedContent(true)
      setTimeout(() => setCopiedContent(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-rose-500" />
            Mẫu Email
          </h2>
          <p className="text-muted-foreground">Quản lý mẫu email cho hệ thống</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm template..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {categoryOptions.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              {searchQuery || categoryFilter !== 'all'
                ? 'Không tìm thấy template nào'
                : 'Chưa có template nào. Tạo template đầu tiên!'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button onClick={openCreateDialog} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Tạo Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => {
            const catConfig = getCategoryConfig(template.category)
            const tags = parseTags(template.tags)
            const Icon = catConfig.icon

            return (
              <Card key={template.id} className="group hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn('p-2 rounded-lg shrink-0', catConfig.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{template.name}</CardTitle>
                        <CardDescription className="text-xs truncate">
                          {template.subject}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Category Badge */}
                  <Badge variant="outline" className={cn('text-xs', catConfig.color)}>
                    {catConfig.label}
                  </Badge>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Content Preview */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(template.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openPreviewDialog(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(template)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Chỉnh sửa Template' : 'Tạo Template Mới'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Cập nhật thông tin template email'
                : 'Điền thông tin để tạo template email mới'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên Template *</Label>
                <Input
                  id="name"
                  placeholder="VD: Welcome Email"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="VD: Chào mừng bạn đến với..."
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="tags"
                  placeholder="VD: welcome, onboarding, user"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung (HTML) *</Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="<html><body><h1>Nội dung email...</h1></body></html>"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs gap-1">
                      <Code className="h-3 w-3" />
                      HTML
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !formData.name || !formData.subject || !formData.content}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Cập nhật' : 'Tạo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Xem trước Template
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} - {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-lg border bg-muted/30">
            <div className="bg-muted px-4 py-2 border-b flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Badge variant="outline" className="text-xs shrink-0">
                  {selectedTemplate && getCategoryConfig(selectedTemplate.category).label}
                </Badge>
                <span className="text-sm text-muted-foreground truncate">
                  Subject: {selectedTemplate?.subject}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => handleCopy(selectedTemplate?.subject || '', 'tiêu đề', 'subject')}
                title="Sao chép tiêu đề"
              >
                {copiedSubject ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <div className="relative">
              <ScrollArea className="h-[400px]">
                <div
                  className="p-4 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate?.content || '' }}
                />
              </ScrollArea>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-4 h-8 gap-2 shadow-sm transition-all"
                onClick={() => handleCopy(selectedTemplate?.content || '', 'nội dung', 'content')}
              >
                {copiedContent ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Sao chép nội dung
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                setPreviewOpen(false)
                if (selectedTemplate) openEditDialog(selectedTemplate)
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa template <strong>{selectedTemplate?.name}</strong>? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
